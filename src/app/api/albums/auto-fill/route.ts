import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRole = process.env.SUPABASE_SECRET_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper to safely parse JSON from model responses
function tryParseJSON(str: any): any {
  if (typeof str === "object" && str !== null) return str;
  if (typeof str !== "string") return {};
  const trimmed = str.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {}

  let cleanStr = trimmed;
  if (cleanStr.startsWith("```")) {
    cleanStr = cleanStr.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
    try {
      return JSON.parse(cleanStr);
    } catch (e) {}
  }

  const braceMatch = cleanStr.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch (e) {}
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authorization check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization token" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
    }

    // 2. Parse request body
    const { albumId, forceTitleUpdate = false } = await request.json();
    if (!albumId) {
      return NextResponse.json({ error: "Missing albumId" }, { status: 400 });
    }

    // 3. Fetch current album and all photos
    const { data: album, error: albumError } = await supabaseAdmin
      .from("albums")
      .select("*")
      .eq("id", albumId)
      .single();

    if (albumError || !album) {
      return NextResponse.json({ error: `Album not found: ${albumError?.message}` }, { status: 404 });
    }

    const { data: photos, error: photosError } = await supabaseAdmin
      .from("photos")
      .select("*")
      .eq("album_id", albumId)
      .order("created_at", { ascending: true });

    if (photosError) {
      return NextResponse.json({ error: `Failed to fetch photos: ${photosError.message}` }, { status: 500 });
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No photos uploaded yet to auto-fill details.",
        album,
      });
    }

    // 4. Calculate earliest photo creation date
    let earliestDateStr: string | null = null;
    let minTimestamp = Infinity;

    for (const photo of photos) {
      let photoDate: Date | null = null;

      // Check EXIF date_taken
      if (photo.exif && photo.exif.date_taken) {
        const parsed = new Date(photo.exif.date_taken);
        if (!isNaN(parsed.getTime())) {
          photoDate = parsed;
        }
      }

      // Fallback to photo.created_at if EXIF date_taken is missing/invalid
      if (!photoDate && photo.created_at) {
        const parsed = new Date(photo.created_at);
        if (!isNaN(parsed.getTime())) {
          photoDate = parsed;
        }
      }

      if (photoDate && photoDate.getTime() < minTimestamp) {
        minTimestamp = photoDate.getTime();
        earliestDateStr = photoDate.toISOString().split("T")[0];
      }
    }

    // 5. Gather photo metadata for location and AI title generation
    const allTags = Array.from(
      new Set(photos.flatMap((p) => p.tags || []))
    ).filter(Boolean);

    const descriptions = photos
      .map((p) => p.description)
      .filter(Boolean) as string[];

    const photoLocations = photos
      .map((p) => p.location)
      .filter(Boolean) as string[];

    // Extract EXIF GPS if available
    let gpsCoords: { latitude: number; longitude: number } | null = null;
    for (const p of photos) {
      if (p.exif?.gps?.latitude && p.exif?.gps?.longitude) {
        gpsCoords = { latitude: p.exif.gps.latitude, longitude: p.exif.gps.longitude };
        break;
      }
    }

    // Reverse geocode if location is missing but GPS is available
    let autoResolvedLocation: string | null = photoLocations[0] || album.location || null;
    if (!autoResolvedLocation && gpsCoords) {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${gpsCoords.latitude}&lon=${gpsCoords.longitude}&format=json`,
          {
            headers: {
              "User-Agent": "PhotographyBlog/1.0",
            },
          }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const address = geoData.address;
          if (address) {
            const city = address.city || address.town || address.village || address.county;
            const country = address.country;
            if (city && country) {
              autoResolvedLocation = `${city}, ${country}`;
            } else if (country) {
              autoResolvedLocation = country;
            } else if (geoData.display_name) {
              autoResolvedLocation = geoData.display_name.split(",").slice(0, 2).join(",");
            }
          }
        }
      } catch (geoErr) {
        console.error("Reverse geocoding error:", geoErr);
      }
    }

    // 6. Generate Title and Description Suggestions using Lightweight Model (Cloudflare Workers AI)
    let aiTitle: string | null = null;
    let alternativeTitles: string[] = [];
    let aiDescription: string | null = null;

    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
    const isDummyCF = !cfAccountId || cfAccountId.includes("dummy") || !cfApiToken || cfApiToken.includes("dummy");

    if (cfAccountId && cfApiToken && !isDummyCF) {
      try {
        const promptContext = `
Photo Collection Summary:
- Number of photos: ${photos.length}
- Earliest date: ${earliestDateStr || "Unknown"}
- Location: ${autoResolvedLocation || "Not specified"}
- Popular tags: ${allTags.slice(0, 12).join(", ")}
- Sample image descriptions: ${descriptions.slice(0, 5).join(" | ")}
`;

        console.log("Calling Cloudflare Workers AI for album title generation...");
        const cfResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${cfApiToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [
                {
                  role: "system",
                  content:
                    'You are an expert photography curator and editor. Analyze the collection metadata and output ONLY a raw JSON object matching this schema: { "title": "A single main album title (2-5 evocative words)", "suggestions": ["3 alternative titles as strings"], "description": "1-2 sentence compelling summary of the photo album", "location": "suggested location name if missing" }',
                },
                {
                  role: "user",
                  content: promptContext,
                },
              ],
              response_format: { type: "json_object" },
            }),
          }
        );

        if (cfResponse.ok) {
          const cfData = await cfResponse.json();
          const responseText = cfData.result?.response || "";
          const parsed = tryParseJSON(responseText);
          if (parsed) {
            aiTitle = parsed.title || null;
            if (Array.isArray(parsed.suggestions)) {
              alternativeTitles = parsed.suggestions.filter(Boolean);
            }
            aiDescription = parsed.description || null;
            if (!autoResolvedLocation && parsed.location) {
              autoResolvedLocation = parsed.location;
            }
          }
        }
      } catch (aiErr) {
        console.error("AI Title Generation error:", aiErr);
      }
    }

    // Fallback title generator if AI failed or keys missing
    if (!aiTitle) {
      const topTag = allTags[0] ? allTags[0].charAt(0).toUpperCase() + allTags[0].slice(1) : "";
      if (autoResolvedLocation) {
        aiTitle = topTag ? `${autoResolvedLocation} — ${topTag}` : `Journey through ${autoResolvedLocation}`;
      } else if (topTag) {
        aiTitle = `${topTag} Series`;
      } else {
        const year = earliestDateStr ? earliestDateStr.split("-")[0] : new Date().getFullYear().toString();
        aiTitle = `Photo Collection ${year}`;
      }

      alternativeTitles = [
        `${autoResolvedLocation || "Visual"} Memories`,
        topTag ? `${topTag} Chronicles` : "Moments Captured",
        earliestDateStr ? `Moments from ${earliestDateStr.split("-")[0]}` : "Untitled Series",
      ];
    }

    // Ensure main title isn't in alternatives
    alternativeTitles = alternativeTitles.filter((t) => t.toLowerCase() !== aiTitle?.toLowerCase());

    // 7. Determine database updates
    const updates: Record<string, any> = {};

    // Update date to earliest photo creation date if available
    if (earliestDateStr && album.date !== earliestDateStr) {
      updates.date = earliestDateStr;
    }

    // Check if album title should be auto-filled
    const isUntitled =
      !album.title ||
      album.title.trim().toLowerCase().startsWith("untitled") ||
      album.title.trim().toLowerCase().startsWith("draft album");

    if ((isUntitled || forceTitleUpdate) && aiTitle) {
      updates.title = aiTitle;

      // Create unique slug
      let baseSlug = slugify(aiTitle);
      if (!baseSlug) baseSlug = `album-${Date.now()}`;
      
      // Check for slug collision
      const { data: existingSlug } = await supabaseAdmin
        .from("albums")
        .select("id")
        .eq("slug", baseSlug)
        .neq("id", albumId)
        .single();

      if (existingSlug) {
        updates.slug = `${baseSlug}-${uuidv4().substring(0, 4)}`;
      } else {
        updates.slug = baseSlug;
      }
    }

    // Update location if empty and resolved
    if (!album.location && autoResolvedLocation) {
      updates.location = autoResolvedLocation;
    }

    // Update description if empty and generated
    if (!album.description && aiDescription) {
      updates.description = aiDescription;
    }

    // Perform update in database if there are changes
    let updatedAlbum = album;
    if (Object.keys(updates).length > 0) {
      const { data: refreshed, error: updateError } = await supabaseAdmin
        .from("albums")
        .update(updates)
        .eq("id", albumId)
        .select()
        .single();

      if (!updateError && refreshed) {
        updatedAlbum = refreshed;
      }
    }

    return NextResponse.json({
      success: true,
      album: updatedAlbum,
      earliestDate: earliestDateStr,
      aiTitle,
      alternativeTitles,
      aiDescription,
      autoResolvedLocation,
      appliedUpdates: updates,
    });
  } catch (err: any) {
    console.error("Auto-fill API error:", err);
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}
