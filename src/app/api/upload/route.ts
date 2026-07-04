import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import exifr from "exifr";
import { v4 as uuidv4 } from "uuid";

// Define candidates for CLIP classification
const CANDIDATE_PROMPTS = [
  "nature", "landscape", "portrait", "street photography", "urban", "architecture",
  "wildlife", "animal", "dog", "cat", "sunset", "sunrise", "night", "dark",
  "indoor", "outdoor", "black and white", "monochrome", "ocean", "sea", "water",
  "mountain", "forest", "tree", "snow", "winter", "summer", "cozy", "moody",
  "minimalist", "vintage", "retro", "travel", "adventure"
];

// Initialize Supabase admin client (since we write to the database and bypass RLS policy checks for authenticated admin)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRole = process.env.SUPABASE_SECRET_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(request: NextRequest) {
  try {
    // 1. Check authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization token" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const albumId = formData.get("albumId") as string | null;
    const locationOverride = formData.get("location") as string | null;
    const sortOrderStr = formData.get("sortOrder") as string | null;

    if (!file || !albumId) {
      return NextResponse.json({ error: "Missing file or albumId" }, { status: 400 });
    }

    const sortOrder = sortOrderStr ? parseInt(sortOrderStr, 10) : 0;

    // 3. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Extract EXIF data
    let exif: any = {};
    let parsedLocation: string | null = locationOverride || null;

    try {
      const rawExif = await exifr.parse(buffer, {
        tiff: true,
        xmp: true,
        gps: true,
      });

      if (rawExif) {
        exif = {
          camera: rawExif.Make && rawExif.Model ? `${rawExif.Make} ${rawExif.Model}` : rawExif.Model || null,
          lens: rawExif.LensModel || rawExif.Lens || null,
          iso: rawExif.ISO || rawExif.ISOSpeedRatings || null,
          aperture: rawExif.FNumber ? `f/${rawExif.FNumber}` : rawExif.ApertureValue ? `f/${rawExif.ApertureValue}` : null,
          shutter: rawExif.ExposureTime
            ? rawExif.ExposureTime < 1
              ? `1/${Math.round(1 / rawExif.ExposureTime)}s`
              : `${rawExif.ExposureTime}s`
            : null,
          focal_length: rawExif.FocalLength ? `${rawExif.FocalLength}mm` : null,
          date_taken: rawExif.DateTimeOriginal || null,
        };

        // If GPS coordinates are present, store them
        if (rawExif.latitude && rawExif.longitude) {
          exif.gps = {
            latitude: rawExif.latitude,
            longitude: rawExif.longitude,
          };
        }
      }
    } catch (exifErr) {
      console.error("EXIF parsing failed:", exifErr);
    }

    // 5. Image dimensions and aspect ratio via Sharp
    const sharpImg = sharp(buffer);
    const metadata = await sharpImg.metadata();
    const width = metadata.width || 2000;
    const height = metadata.height || 2000;
    const aspect_ratio = parseFloat((width / height).toFixed(2));

    // 6. Extract dominant color palette (5 representative colors)
    // We resize down to 5x5 using sharp to aggregate regional average colors quickly and safely.
    const tinyBuffer = await sharpImg
      .resize(5, 5, { fit: "fill" })
      .raw()
      .toBuffer();

    const sampleIndices = [0, 6, 12, 18, 24]; // diagonal and center samples in the 25-pixel grid
    const color_palette: string[] = [];
    for (const idx of sampleIndices) {
      const offset = idx * 3; // 3 bytes per pixel (RGB)
      if (offset + 2 < tinyBuffer.length) {
        const r = tinyBuffer[offset];
        const g = tinyBuffer[offset + 1];
        const b = tinyBuffer[offset + 2];
        const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
        color_palette.push(hex.toUpperCase());
      }
    }

    // 7. Compress images for web delivery
    // Main optimized image (max 2048px)
    const optimizedBuffer = await sharp(buffer)
      .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Small timeline thumbnail (max 300px)
    const thumbnailBuffer = await sharp(buffer)
      .resize(300, 300, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();

    // 8. Upload to Cloudflare R2
    const fileUuid = uuidv4();
    const mainKey = `albums/${albumId}/${fileUuid}-main.webp`;
    const thumbKey = `albums/${albumId}/${fileUuid}-thumb.webp`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: mainKey,
        Body: optimizedBuffer,
        ContentType: "image/webp",
      })
    );

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: thumbKey,
        Body: thumbnailBuffer,
        ContentType: "image/webp",
      })
    );

    const imageUrl = `${R2_PUBLIC_URL}/${mainKey}`;
    const thumbnailUrl = `${R2_PUBLIC_URL}/${thumbKey}`;

    // 9. Generate AI Tags using Cloudflare Workers AI (CLIP)
    let aiTags: string[] = [];
    try {
      const clipInputBuffer = await sharp(buffer)
        .resize(512, 512, { fit: "inside" })
        .jpeg({ quality: 75 })
        .toBuffer();
      const base64Image = clipInputBuffer.toString("base64");

      const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

      if (cfAccountId && cfApiToken) {
        const cfResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/openai/clip-vit-base-patch32`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${cfApiToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64Image,
              prompt: CANDIDATE_PROMPTS,
            }),
          }
        );

        const cfData = await cfResponse.json();
        if (cfData.success && cfData.result) {
          // Filter matching prompts with score > 0.15
          aiTags = cfData.result
            .filter((item: { label: string; score: number }) => item.score > 0.15)
            .map((item: { label: string; score: number }) => item.label);
        }
      }
    } catch (cfErr) {
      console.error("Cloudflare Workers AI CLIP generation failed:", cfErr);
    }

    // Add smart EXIF rule-based tags
    if (exif.date_taken) {
      try {
        const dateObj = new Date(exif.date_taken);
        const hour = dateObj.getHours();
        if (hour < 6 || hour > 20) {
          if (!aiTags.includes("night")) aiTags.push("night");
          if (!aiTags.includes("night photography")) aiTags.push("night photography");
        }
        
        // Add year tag
        const year = dateObj.getFullYear().toString();
        if (!aiTags.includes(year)) aiTags.push(year);
      } catch (err) {
        console.error("Error parsing EXIF date for tags:", err);
      }
    }

    if (exif.camera && exif.camera.includes("Sony")) {
      aiTags.push("Sony");
    }

    // 10. Write to database (Supabase)
    const { data: photoData, error: dbError } = await supabaseAdmin
      .from("photos")
      .insert({
        album_id: albumId,
        url: imageUrl,
        thumbnail_url: thumbnailUrl,
        width,
        height,
        aspect_ratio,
        location: parsedLocation,
        tags: aiTags,
        color_palette,
        exif,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: `Database write failed: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      photo: photoData,
    });

  } catch (err: any) {
    console.error("Upload API crash:", err);
    return NextResponse.json({ error: `Server crash: ${err.message || err}` }, { status: 500 });
  }
}
