import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Photo, Album } from "@/lib/types";

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

interface CuratedItem {
  photoId: string;
  groupId: string | null;
  curatorialNote?: string;
}

interface CuratedPlan {
  coverPhotoId: string;
  coverRationale: string;
  alternativeCoverIds: string[];
  openingPhotoId: string;
  curatorialSummary: string;
  layout: CuratedItem[];
}

/**
 * Robust heuristic curatorial engine that runs when AI credentials are absent
 * or as a baseline fallback for visual harmony and editorial narrative.
 */
function curateHeuristically(
  photos: Photo[],
  album: Album,
  style: "editorial" | "visual" | "chronological" = "editorial"
): CuratedPlan {
  if (photos.length === 0) {
    return {
      coverPhotoId: "",
      coverRationale: "No photos to curate.",
      alternativeCoverIds: [],
      openingPhotoId: "",
      curatorialSummary: "Empty album.",
      layout: [],
    };
  }

  // 1. Determine Cover Photo Candidates
  // High preference for landscape / wide orientation (aspect_ratio >= 1.15)
  // and highest score or rich visual tags
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
    const heroKeywords = ["landscape", "sunset", "horizon", "wide", "view", "ocean", "mountain", "sky", "architecture", "city"];
    heroKeywords.forEach((kw) => {
      if (tagsLower.includes(kw) || descLower.includes(kw)) weight += 8;
    });

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
    // Balance visual rhythm: alternate orientations (landscape vs portrait)
    const landscapes = photos.filter((p) => (p.aspect_ratio || 1.5) >= 1.1);
    const portraits = photos.filter((p) => (p.aspect_ratio || 1.5) < 1.1);
    const interleaved: Photo[] = [];
    let l = 0;
    let p = 0;
    while (l < landscapes.length || p < portraits.length) {
      if (l < landscapes.length) interleaved.push(landscapes[l++]);
      if (p < portraits.length) {
        interleaved.push(portraits[p++]);
        if (p < portraits.length) interleaved.push(portraits[p++]); // Often pair 2 portraits
      }
    }
    orderedList = interleaved.length === photos.length ? interleaved : photos;
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
      return text.includes("sunset") || text.includes("dusk") || text.includes("night") || text.includes("silhouette");
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

  // 3. Editorial Grouping: Side-by-Side Rows
  // Pair consecutive portrait-oriented photos (aspect_ratio < 1.1) into diptychs
  // Keep wide panoramic/landscape photos standalone as solo hero statements
  const layout: CuratedItem[] = [];
  let groupCounter = 1;
  let idx = 0;

  while (idx < orderedList.length) {
    const current = orderedList[idx];
    const currentAr = current.aspect_ratio || 1.5;
    const isPortrait = currentAr < 1.1;

    // Check if next photo can form a diptych with current
    if (isPortrait && idx + 1 < orderedList.length) {
      const next = orderedList[idx + 1];
      const nextAr = next.aspect_ratio || 1.5;
      const nextIsPortrait = nextAr < 1.15;

      if (nextIsPortrait) {
        const groupId = `row_ai_${Date.now().toString(36)}_${groupCounter++}`;
        layout.push({
          photoId: current.id,
          groupId,
          curatorialNote: "Paired diptych (Left) — Balanced vertical composition",
        });
        layout.push({
          photoId: next.id,
          groupId,
          curatorialNote: "Paired diptych (Right) — Visual dialogue pair",
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
          : currentAr >= 1.2
          ? "Wide environmental feature (Standalone)"
          : "Focal portrait stillness (Standalone)",
    });
    idx++;
  }

  const openingPhoto = layout[0]?.photoId || bestCover.id;
  const diptychCount = layout.filter((item) => item.groupId !== null).length / 2;

  return {
    coverPhotoId: bestCover.id,
    coverRationale: `Selected for its strong composition, optimal landscape aspect ratio (${bestCover.aspect_ratio || "3:2"}), and dynamic color depth that elevates the album hero banner.`,
    alternativeCoverIds: altCovers,
    openingPhotoId: openingPhoto,
    curatorialSummary: `Curated ${photos.length} stills into a ${style} flow: opening with an establishing frame, pairing ${Math.floor(diptychCount)} vertical diptychs for visual rhythm, and letting wide cinematic shots breathe as full-width hero moments.`,
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
      style = "editorial", // "editorial" | "visual" | "chronological"
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
          dateTaken: p.exif?.date_taken || null,
        }));

        const promptContext = `
Album Context:
- Title: "${album.title || "Untitled"}"
- Description: "${album.description || "N/A"}"
- Location: "${album.location || "N/A"}"
- Curation Style requested: "${style}"

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
                  content: `You are an expert photography exhibition curator and art director.
Curate the sequence, cover, and grouping for this photo collection into an engaging editorial story.

Principles:
1. Cover Photo ("coverPhotoId"):
   - Choose the most striking, evocative image that represents the heart of the album.
   - Strongly prefer landscape orientation (aspectRatio >= 1.2) with high score to look stunning in the hero banner.
   - Also provide 2 runner-up alternative cover photo IDs in "alternativeCoverIds".
2. Gallery Opener ("openingPhotoId"):
   - The first photo displayed in the gallery feed. Usually an establishing wide shot or contextual entrance.
3. Sequencing & Narrative Pacing:
   - Order the photos thoughtfully ("layout" array). Progression should feel intentional: establishing context -> intimate details / portraits -> sunset / climax.
   - Avoid monotonous repetitions of the same framing.
4. Editorial Grouping:
   - Group photos into side-by-side rows by giving them matching "groupId" strings (e.g. "group_1", "group_2").
   - Maximum 3 photos per group; minimum 2 photos per group.
   - Pair portrait orientation photos (aspectRatio < 1.0) into 2-photo diptychs.
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
            // Validate that returned layout contains valid photo IDs
            const validIds = new Set(photos.map((p) => p.id));
            const seenIds = new Set<string>();
            const sanitizedLayout: CuratedItem[] = [];

            // Group mapping from LLM's group names (e.g. "group_1") to unique row IDs
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

            // Filter out groups that have fewer than 2 items
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

            plan = {
              coverPhotoId: validIds.has(parsed.coverPhotoId) ? parsed.coverPhotoId : photos[0].id,
              coverRationale: parsed.coverRationale || "Selected for exceptional composition and thematic resonance.",
              alternativeCoverIds: Array.isArray(parsed.alternativeCoverIds)
                ? parsed.alternativeCoverIds.filter((id: string) => validIds.has(id))
                : [],
              openingPhotoId: validIds.has(parsed.openingPhotoId) ? parsed.openingPhotoId : finalizedLayout[0].photoId,
              curatorialSummary: parsed.curatorialSummary || "Curated for narrative flow and visual rhythm.",
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
      console.log("Applying smart heuristic layout curation...");
      plan = curateHeuristically(photos, album, style);
    }

    // 6. If requested, apply changes directly to database
    let updatedAlbum = album;
    let updatedPhotos = photos;

    if (applyImmediately && plan) {
      // Find cover photo URL
      const chosenCoverPhoto = photos.find((p) => p.id === plan?.coverPhotoId);
      const coverUrl = chosenCoverPhoto ? chosenCoverPhoto.url : album.cover_image_url;

      // Update album cover if changed
      if (coverUrl && coverUrl !== album.cover_image_url) {
        const { data: refreshedAlbum, error: albumUpdateErr } = await supabaseAdmin
          .from("albums")
          .update({ cover_image_url: coverUrl })
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

    // Calculate grouping count
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
