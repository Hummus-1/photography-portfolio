import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Photo, Album } from "@/lib/types";
import { hexToRgb } from "@/lib/color-utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRole = process.env.SUPABASE_SECRET_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

// Helper to safely parse JSON from model responses
function tryParseJSON(str: any): any {
  if (typeof str === "object" && str !== null) return str;
  if (typeof str !== "string") return null;
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

export interface CuratedItem {
  photoId: string;
  groupId: string | null;
  curatorialNote?: string;
}

export interface RhythmBreakdown {
  score: number;
  orientationBalance: "Balanced" | "High Variety" | "Uniform";
  chromaticHarmony: "Harmonious" | "Dynamic Contrast" | "Monochrome / Neutral";
  pacingRating: "Exhibition Quality" | "Strong Editorial Flow" | "Sequential";
}

export interface CuratedPlan {
  coverPhotoId: string;
  coverRationale: string;
  alternativeCoverIds: string[];
  openingPhotoId: string;
  curatorialSummary: string;
  rhythm: RhythmBreakdown;
  layout: CuratedItem[];
}

/**
 * Calculates chromatic similarity between the primary tones of two palettes (0 to 1).
 */
function calculatePaletteSimilarity(p1?: string[], p2?: string[]): number {
  if (!p1?.length || !p2?.length) return 0.5;
  const rgb1 = hexToRgb(p1[0]);
  const rgb2 = hexToRgb(p2[0]);
  if (!rgb1 || !rgb2) return 0.5;
  const dist = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
  return Math.max(0, 1 - dist / 442);
}

/**
 * Calculates time difference in seconds between two EXIF date strings.
 */
function getTimeDeltaSeconds(dateA?: string | null, dateB?: string | null): number | null {
  if (!dateA || !dateB) return null;
  const tA = new Date(dateA).getTime();
  const tB = new Date(dateB).getTime();
  if (isNaN(tA) || isNaN(tB)) return null;
  return Math.abs(tA - tB) / 1000;
}

/**
 * Evaluates the visual rhythm and editorial pacing score (0-100) of a sequence.
 */
function evaluateVisualRhythm(layout: CuratedItem[], photosMap: Map<string, Photo>): RhythmBreakdown {
  if (layout.length <= 1) {
    return {
      score: 85,
      orientationBalance: "Uniform",
      chromaticHarmony: "Harmonious",
      pacingRating: "Strong Editorial Flow",
    };
  }

  let landscapeCount = 0;
  let portraitCount = 0;
  let groupCount = 0;
  let colorHarmonyTotal = 0;
  let colorPairs = 0;

  for (let i = 0; i < layout.length; i++) {
    const p = photosMap.get(layout[i].photoId);
    if (!p) continue;
    const ar = p.aspect_ratio || 1.5;
    if (ar >= 1.15) landscapeCount++;
    else portraitCount++;

    if (layout[i].groupId) {
      groupCount++;
      if (i > 0 && layout[i - 1].groupId === layout[i].groupId) {
        const prev = photosMap.get(layout[i - 1].photoId);
        if (prev) {
          colorHarmonyTotal += calculatePaletteSimilarity(prev.color_palette, p.color_palette);
          colorPairs++;
        }
      }
    }
  }

  const orientationRatio = Math.min(landscapeCount, portraitCount) / Math.max(1, Math.max(landscapeCount, portraitCount));
  const avgHarmony = colorPairs > 0 ? colorHarmonyTotal / colorPairs : 0.65;
  const groupRatio = groupCount / Math.max(1, layout.length);

  // Ideal group ratio is ~20% to ~50%
  const pacingBonus = groupRatio >= 0.15 && groupRatio <= 0.6 ? 20 : 12;
  const orientationBonus = orientationRatio >= 0.35 ? 25 : 15;
  const harmonyBonus = Math.round(avgHarmony * 30);
  const baseScore = 25;

  const totalScore = Math.min(98, Math.max(72, baseScore + pacingBonus + orientationBonus + harmonyBonus));

  return {
    score: totalScore,
    orientationBalance: orientationRatio >= 0.4 ? "Balanced" : orientationRatio >= 0.2 ? "High Variety" : "Uniform",
    chromaticHarmony: avgHarmony >= 0.6 ? "Harmonious" : avgHarmony >= 0.4 ? "Dynamic Contrast" : "Monochrome / Neutral",
    pacingRating: totalScore >= 90 ? "Exhibition Quality" : totalScore >= 80 ? "Strong Editorial Flow" : "Sequential",
  };
}

/**
 * Robust heuristic curatorial engine that runs when AI credentials are absent
 * or as a baseline fallback for visual harmony and editorial narrative.
 */
function curateHeuristically(
  photos: Photo[],
  album: Album,
  style: "editorial" | "visual" | "minimalist" | "chronological" = "editorial",
  density: "spacious" | "balanced" | "dense" = "balanced"
): CuratedPlan {
  if (photos.length === 0) {
    return {
      coverPhotoId: "",
      coverRationale: "No photos to curate.",
      alternativeCoverIds: [],
      openingPhotoId: "",
      curatorialSummary: "Empty album.",
      rhythm: {
        score: 0,
        orientationBalance: "Uniform",
        chromaticHarmony: "Harmonious",
        pacingRating: "Sequential",
      },
      layout: [],
    };
  }

  const photosMap = new Map<string, Photo>();
  photos.forEach((p) => photosMap.set(p.id, p));

  // 1. Determine Cover Photo Candidates
  // High preference for landscape / wide orientation (aspect_ratio >= 1.15)
  // and highest visual score + vibrant color palette + rich visual tags
  const scoredPhotos = [...photos].map((p) => {
    let weight = (p.score ?? 5) * 10;
    const ar = p.aspect_ratio || (p.width && p.height ? p.width / p.height : 1.5);

    // Landscape bonus for hero banner
    if (ar >= 1.25 && ar <= 2.2) weight += 25;
    else if (ar >= 1.0) weight += 10;
    else weight -= 15; // Vertical penalty for main hero banner

    // Keyword bonus
    const tagsLower = (p.tags || []).map((t) => t.toLowerCase()).join(" ");
    const descLower = (p.description || "").toLowerCase();
    const heroKeywords = [
      "landscape", "sunset", "horizon", "wide", "view", "ocean", "mountain", "sky",
      "architecture", "city", "establishing", "scenic", "panoramic"
    ];
    heroKeywords.forEach((kw) => {
      if (tagsLower.includes(kw) || descLower.includes(kw)) weight += 8;
    });

    // Palette bonus if rich
    if (p.color_palette && p.color_palette.length >= 3) weight += 5;

    return { photo: p, weight, ar };
  });

  scoredPhotos.sort((a, b) => b.weight - a.weight);

  const bestCover = scoredPhotos[0]?.photo || photos[0];
  const altCovers = scoredPhotos.slice(1, 4).map((s) => s.photo.id);

  // 2. Sort Photos Based on Selected Curatorial Style
  let orderedList: Photo[] = [...photos];

  if (style === "chronological") {
    // Sort chronologically by EXIF date_taken or created_at
    orderedList.sort((a, b) => {
      const dateA = a.exif?.date_taken || (a as any).created_at || "";
      const dateB = b.exif?.date_taken || (b as any).created_at || "";
      return dateA.localeCompare(dateB);
    });
  } else if (style === "visual") {
    // Balance visual rhythm: alternate orientations (landscape vs portrait) with color harmony
    const landscapes = photos.filter((p) => (p.aspect_ratio || 1.5) >= 1.1);
    const portraits = photos.filter((p) => (p.aspect_ratio || 1.5) < 1.1);
    const interleaved: Photo[] = [];
    let l = 0;
    let p = 0;

    while (l < landscapes.length || p < portraits.length) {
      if (l < landscapes.length) interleaved.push(landscapes[l++]);
      if (p < portraits.length) {
        interleaved.push(portraits[p++]);
        // Pair another portrait if density allows
        if (density !== "spacious" && p < portraits.length) {
          interleaved.push(portraits[p++]);
        }
      }
    }
    orderedList = interleaved.length === photos.length ? interleaved : photos;
  } else if (style === "minimalist") {
    // Fine Art / Minimalist: spacious solo frames, highlighting highest scoring stills
    orderedList.sort((a, b) => {
      const dateA = a.exif?.date_taken || "";
      const dateB = b.exif?.date_taken || "";
      if (dateA && dateB) return dateA.localeCompare(dateB);
      return (b.score ?? 5) - (a.score ?? 5);
    });
  } else {
    // Default: "editorial" (Narrative Arc)
    // - Opener: Establishing wide scene (bestCover or wide landscape)
    // - Middle: Progress through scenes, candid moments, details
    // - Finale: Golden hour, sunset, night, or atmospheric shot
    const pool = [...photos];
    const sequence: Photo[] = [];

    // Choose opener: prefer bestCover if wide, or an establishing wide shot
    const openerIdx = pool.findIndex((p) => p.id === bestCover.id);
    if (openerIdx !== -1) {
      sequence.push(pool.splice(openerIdx, 1)[0]);
    } else {
      const wideIdx = pool.findIndex((p) => (p.aspect_ratio || 1.5) >= 1.25);
      if (wideIdx !== -1) sequence.push(pool.splice(wideIdx, 1)[0]);
      else if (pool.length > 0) sequence.push(pool.shift()!);
    }

    // Identify potential closing shot (sunset, night, or highest remaining score)
    let closingShot: Photo | null = null;
    const closingIdx = pool.findIndex((p) => {
      const text = `${p.tags?.join(" ")} ${p.description || ""}`.toLowerCase();
      return (
        text.includes("sunset") ||
        text.includes("dusk") ||
        text.includes("night") ||
        text.includes("twilight") ||
        text.includes("silhouette")
      );
    });
    if (closingIdx !== -1 && pool.length > 2) {
      closingShot = pool.splice(closingIdx, 1)[0];
    }

    // Sort remaining pool semi-chronologically
    pool.sort((a, b) => {
      const dateA = a.exif?.date_taken || "";
      const dateB = b.exif?.date_taken || "";
      if (dateA && dateB) return dateA.localeCompare(dateB);
      return (b.score ?? 5) - (a.score ?? 5);
    });

    sequence.push(...pool);
    if (closingShot) sequence.push(closingShot);
    orderedList = sequence;
  }

  // 3. Editorial Grouping with Burst Detection & Color Harmony
  const layout: CuratedItem[] = [];
  let groupCounter = 1;
  let idx = 0;

  while (idx < orderedList.length) {
    const current = orderedList[idx];
    const currentAr = current.aspect_ratio || 1.5;
    const isPortrait = currentAr < 1.1;

    // Check for Burst / Triptych possibility (3 photos close in time or portrait)
    if (
      density === "dense" &&
      idx + 2 < orderedList.length &&
      style !== "minimalist"
    ) {
      const p2 = orderedList[idx + 1];
      const p3 = orderedList[idx + 2];
      const delta1 = getTimeDeltaSeconds(current.exif?.date_taken, p2.exif?.date_taken);
      const delta2 = getTimeDeltaSeconds(p2.exif?.date_taken, p3.exif?.date_taken);

      const isTimeBurst = delta1 !== null && delta2 !== null && delta1 <= 90 && delta2 <= 90;
      const areAllPortraits = isPortrait && (p2.aspect_ratio || 1.5) < 1.15 && (p3.aspect_ratio || 1.5) < 1.15;

      if (isTimeBurst || areAllPortraits) {
        const groupId = `row_ai_${Date.now().toString(36)}_${groupCounter++}`;
        const note = isTimeBurst ? "Burst sequence triptych" : "Editorial vertical triptych";
        layout.push({ photoId: current.id, groupId, curatorialNote: `${note} (1/3)` });
        layout.push({ photoId: p2.id, groupId, curatorialNote: `${note} (2/3)` });
        layout.push({ photoId: p3.id, groupId, curatorialNote: `${note} (3/3)` });
        idx += 3;
        continue;
      }
    }

    // Check for Diptych possibility (2 photos: portraits or burst timestamp)
    if (idx + 1 < orderedList.length && density !== "spacious") {
      const next = orderedList[idx + 1];
      const nextAr = next.aspect_ratio || 1.5;
      const nextIsPortrait = nextAr < 1.15;
      const timeDelta = getTimeDeltaSeconds(current.exif?.date_taken, next.exif?.date_taken);
      const isBurstPair = timeDelta !== null && timeDelta <= 120;
      const colorSim = calculatePaletteSimilarity(current.color_palette, next.color_palette);

      // Pair if both are portraits, or if burst pair, or if color similarity is high (>0.75) and neither is panoramic
      const shouldPair =
        (isPortrait && nextIsPortrait) ||
        (isBurstPair && currentAr < 1.6 && nextAr < 1.6) ||
        (colorSim >= 0.78 && currentAr <= 1.35 && nextAr <= 1.35 && density === "dense");

      if (shouldPair) {
        const groupId = `row_ai_${Date.now().toString(36)}_${groupCounter++}`;
        const rationale = isBurstPair
          ? "Sequential action diptych"
          : isPortrait && nextIsPortrait
          ? "Paired vertical diptych — Geometric balance"
          : "Color harmony diptych";

        layout.push({
          photoId: current.id,
          groupId,
          curatorialNote: `${rationale} (Left)`,
        });
        layout.push({
          photoId: next.id,
          groupId,
          curatorialNote: `${rationale} (Right)`,
        });
        idx += 2;
        continue;
      }
    }

    // Standalone full-width or wide editorial frame
    layout.push({
      photoId: current.id,
      groupId: null,
      curatorialNote:
        currentAr >= 1.6
          ? "Cinematic panoramic frame (Standalone)"
          : currentAr >= 1.25
          ? "Wide environmental feature (Standalone)"
          : "Focal still moment (Standalone)",
    });
    idx++;
  }

  const openingPhoto = layout[0]?.photoId || bestCover.id;
  const groupsCreated = new Set(layout.map((item) => item.groupId).filter(Boolean)).size;
  const rhythm = evaluateVisualRhythm(layout, photosMap);

  const styleDescriptions = {
    editorial: "an editorial narrative arc with an establishing opener, intimate diptychs, and an evocative finale",
    visual: "a geometrically rhythmic layout balancing horizontal breathers and portrait diptychs with color harmony",
    minimalist: "a fine-art gallery flow offering generous full-width space for each composition",
    chronological: "a documentary timeline sequence preserving authentic moments as they unfolded",
  };

  return {
    coverPhotoId: bestCover.id,
    coverRationale: `Selected for its strong composition, optimal landscape aspect ratio (${bestCover.aspect_ratio || "3:2"}), and dynamic color depth that elevates the album hero banner.`,
    alternativeCoverIds: altCovers,
    openingPhotoId: openingPhoto,
    curatorialSummary: `Curated ${photos.length} stills into ${styleDescriptions[style]}. Formed ${groupsCreated} multi-column editorial rows while letting grand landscapes command standalone focus.`,
    rhythm,
    layout,
  };
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
    const {
      albumId,
      style = "editorial", // "editorial" | "visual" | "minimalist" | "chronological"
      density = "balanced", // "spacious" | "balanced" | "dense"
      applyImmediately = false,
    } = await request.json();

    if (!albumId) {
      return NextResponse.json({ error: "Missing albumId parameter" }, { status: 400 });
    }

    // 3. Fetch album and photos
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
      .order("sort_order", { ascending: true });

    if (photosError) {
      return NextResponse.json({ error: `Failed to fetch photos: ${photosError.message}` }, { status: 500 });
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No photos uploaded yet to curate layout.",
        plan: null,
      });
    }

    const photosMap = new Map<string, Photo>();
    photos.forEach((p) => photosMap.set(p.id, p));

    let plan: CuratedPlan | null = null;

    // 4. Attempt AI Curation using Cloudflare Workers AI if configured
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
    const isDummyCF = !cfAccountId || cfAccountId.includes("dummy") || !cfApiToken || cfApiToken.includes("dummy");

    if (cfAccountId && cfApiToken && !isDummyCF) {
      try {
        const photoMetadataSummary = photos.map((p, idx) => ({
          id: p.id,
          index: idx + 1,
          aspectRatio: p.aspect_ratio,
          orientation: p.aspect_ratio >= 1.2 ? "landscape" : p.aspect_ratio <= 0.85 ? "portrait" : "square",
          score: p.score ?? null,
          description: p.description || "",
          tags: (p.tags || []).slice(0, 6),
          colorPalette: (p.color_palette || []).slice(0, 3),
          dateTaken: p.exif?.date_taken || null,
        }));

        const promptContext = `
Album Context:
- Title: "${album.title || "Untitled"}"
- Description: "${album.description || "N/A"}"
- Location: "${album.location || "N/A"}"
- Curatorial Philosophy requested: "${style}" (Options: editorial, visual, minimalist, chronological)
- Grouping Density requested: "${density}" (Options: spacious, balanced, dense)

Photos Collection (${photos.length} stills):
${JSON.stringify(photoMetadataSummary, null, 2)}
`;

        console.log("Calling Cloudflare Workers AI for editorial layout curation...");
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
                  content: `You are an expert photography exhibition curator, art director, and visual editor.
Curate the sequence, cover, and grouping for this photo collection into an engaging exhibition.

Principles:
1. Cover Photo ("coverPhotoId"):
   - Choose the most striking, evocative image that represents the heart of the album.
   - Strongly prefer landscape orientation (aspectRatio >= 1.2) with high quality score.
   - Provide 2-3 runner-up alternative cover photo IDs in "alternativeCoverIds".
2. Gallery Opener ("openingPhotoId"):
   - The first photo displayed in the gallery feed. Usually an establishing wide shot or contextual entrance.
3. Sequencing & Narrative Pacing:
   - Order the photos thoughtfully ("layout" array). Progression should feel intentional: establishing context -> intimate details / portraits -> sunset / climax.
   - Respect the chosen philosophy (${style}) and density (${density}).
4. Editorial Grouping:
   - Group photos into side-by-side rows by assigning matching "groupId" strings (e.g. "group_1", "group_2").
   - 2 photos for diptychs; 3 photos for burst triptychs. Minimum 2, maximum 3.
   - Pair portrait orientation photos (aspectRatio < 1.0) into diptychs.
   - Pair photos with complementary or matching color palettes and close timestamps.
   - Keep panoramic or wide landscape shots standalone with "groupId": null.
   - Every photo must be included exactly once in the "layout" array.

Output ONLY a raw JSON object strictly matching this schema:
{
  "coverPhotoId": "string (valid photo ID)",
  "coverRationale": "1-2 sentence explanation of why this photo is the perfect cover",
  "alternativeCoverIds": ["photo ID", "photo ID"],
  "openingPhotoId": "string (valid photo ID)",
  "curatorialSummary": "2-3 sentences explaining the story arc, pacing, and visual dialogue of this curation",
  "layout": [
    {
      "photoId": "string (valid photo ID)",
      "groupId": "string (e.g. group_1) or null",
      "curatorialNote": "brief note on role (e.g. establishing wide frame, portrait diptych left)"
    }
  ]
}`,
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

          if (parsed && parsed.coverPhotoId && Array.isArray(parsed.layout)) {
            const validIds = new Set(photos.map((p) => p.id));
            const seenIds = new Set<string>();
            const sanitizedLayout: CuratedItem[] = [];

            const groupMap = new Map<string, string>();
            let rowIdx = 1;

            for (const item of parsed.layout) {
              if (item.photoId && validIds.has(item.photoId) && !seenIds.has(item.photoId)) {
                seenIds.add(item.photoId);
                let finalGroupId: string | null = null;

                if (item.groupId && typeof item.groupId === "string" && item.groupId.trim() !== "") {
                  const gKey = item.groupId.trim();
                  if (!groupMap.has(gKey)) {
                    groupMap.set(gKey, `row_ai_${Date.now().toString(36)}_${rowIdx++}`);
                  }
                  finalGroupId = groupMap.get(gKey)!;
                }

                sanitizedLayout.push({
                  photoId: item.photoId,
                  groupId: finalGroupId,
                  curatorialNote: item.curatorialNote || undefined,
                });
              }
            }

            // Append any missing photos at the end
            for (const p of photos) {
              if (!seenIds.has(p.id)) {
                sanitizedLayout.push({
                  photoId: p.id,
                  groupId: null,
                  curatorialNote: "Solo editorial frame",
                });
              }
            }

            // Filter out groups with fewer than 2 items
            const groupCounts: Record<string, number> = {};
            sanitizedLayout.forEach((item) => {
              if (item.groupId) {
                groupCounts[item.groupId] = (groupCounts[item.groupId] || 0) + 1;
              }
            });

            const finalizedLayout = sanitizedLayout.map((item) => ({
              ...item,
              groupId: item.groupId && groupCounts[item.groupId] >= 2 ? item.groupId : null,
            }));

            const rhythm = evaluateVisualRhythm(finalizedLayout, photosMap);

            plan = {
              coverPhotoId: validIds.has(parsed.coverPhotoId) ? parsed.coverPhotoId : photos[0].id,
              coverRationale: parsed.coverRationale || "Selected for exceptional composition and thematic resonance.",
              alternativeCoverIds: Array.isArray(parsed.alternativeCoverIds)
                ? parsed.alternativeCoverIds.filter((id: string) => validIds.has(id))
                : [],
              openingPhotoId: validIds.has(parsed.openingPhotoId) ? parsed.openingPhotoId : finalizedLayout[0].photoId,
              curatorialSummary: parsed.curatorialSummary || "Curated for narrative flow and visual rhythm.",
              rhythm,
              layout: finalizedLayout,
            };
          }
        }
      } catch (aiErr) {
        console.error("AI Layout Curation failed, falling back to heuristic engine:", aiErr);
      }
    }

    // 5. Fallback to heuristic curation if AI didn't run or failed
    if (!plan) {
      console.log("Applying smart heuristic layout curation with burst detection & color harmony...");
      plan = curateHeuristically(photos, album, style, density);
    }

    // 6. If requested, apply changes directly to database
    let updatedAlbum = album;
    let updatedPhotos = photos;

    if (applyImmediately && plan) {
      const chosenCoverPhoto = photos.find((p) => p.id === plan?.coverPhotoId);
      const coverUrl = chosenCoverPhoto ? chosenCoverPhoto.url : album.cover_image_url;
      const coverPalette = chosenCoverPhoto?.color_palette || album.cover_color_palette || [];

      // Update album cover and its synchronized color palette
      if (coverUrl && coverUrl !== album.cover_image_url) {
        const { data: refreshedAlbum, error: albumUpdateErr } = await supabaseAdmin
          .from("albums")
          .update({
            cover_image_url: coverUrl,
            cover_color_palette: coverPalette,
          })
          .eq("id", albumId)
          .select()
          .single();

        if (!albumUpdateErr && refreshedAlbum) {
          updatedAlbum = refreshedAlbum;
        }
      }

      // Update each photo's sort_order and group_id
      const photoUpdates = plan.layout.map((item, idx) =>
        supabaseAdmin
          .from("photos")
          .update({
            sort_order: idx,
            group_id: item.groupId,
          })
          .eq("id", item.photoId)
      );

      await Promise.all(photoUpdates);

      // Fetch refreshed photos in updated order
      const { data: refreshedPhotos } = await supabaseAdmin
        .from("photos")
        .select("*")
        .eq("album_id", albumId)
        .order("sort_order", { ascending: true });

      if (refreshedPhotos) {
        updatedPhotos = refreshedPhotos;
      }
    }

    const groupsSet = new Set(plan.layout.map((item) => item.groupId).filter(Boolean));

    return NextResponse.json({
      success: true,
      plan,
      album: updatedAlbum,
      photos: updatedPhotos,
      groupsCreated: groupsSet.size,
      applied: applyImmediately,
    });
  } catch (err: any) {
    console.error("Curate Layout API error:", err);
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}
