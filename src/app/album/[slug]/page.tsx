import { createClient } from "@supabase/supabase-js";
import { supabase as publicSupabase } from "@/lib/supabase";
import { Navigation } from "@/components/navigation";
import { AlbumViewer } from "@/components/album-viewer";
import { notFound } from "next/navigation";
import { Album, Photo } from "@/lib/types";
import { MOCK_ALBUMS_MAP } from "@/lib/mock-data";
import { Eye } from "lucide-react";

function getSupabaseClient(isPreview: boolean) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (isPreview && supabaseUrl && secretKey) {
    return createClient(supabaseUrl, secretKey);
  }
  return publicSupabase;
}

async function getAlbumData(slug: string, isPreview: boolean = false) {
  const db = getSupabaseClient(isPreview);
  try {
    const { data: album, error: albumError } = await db
      .from("albums_with_locations")
      .select("*")
      .eq("slug", slug)
      .single();

    if (albumError || !album) {
      if (MOCK_ALBUMS_MAP[slug]) {
        return MOCK_ALBUMS_MAP[slug];
      }
      return null;
    }

    const { data: photos, error: photosError } = await db
      .from("photos")
      .select("*")
      .eq("album_id", album.id)
      .order("sort_order", { ascending: true });

    if (photosError) {
      throw photosError;
    }

    const photoList = (photos || []) as Photo[];
    const coverPhoto = photoList.find((p) => p.url === album.cover_image_url) || photoList[0];
    const cover_color_palette =
      album.cover_color_palette && album.cover_color_palette.length > 0
        ? album.cover_color_palette
        : coverPhoto?.color_palette || [];

    return {
      album: {
        ...album,
        cover_color_palette,
      } as Album,
      photos: photoList,
    };
  } catch {
    if (MOCK_ALBUMS_MAP[slug]) {
      return MOCK_ALBUMS_MAP[slug];
    }
    return null;
  }
}

interface AlbumPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    preview?: string;
  }>;
}

export default async function AlbumPage({ params, searchParams }: AlbumPageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  const data = await getAlbumData(slug, isPreview);

  if (!data) {
    notFound();
  }

  const isDraft = !data.album.is_published;

  if (isDraft && !isPreview) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-400">
      {isDraft && (
        <div className="bg-primary/20 border-b border-primary/30 text-primary px-4 py-2.5 text-xs font-mono text-center flex items-center justify-center gap-2">
          <Eye className="h-4 w-4 text-primary shrink-0" />
          <span>UNPUBLISHED DRAFT PREVIEW — Only visible in admin preview mode</span>
          <a href="/limonada" className="underline text-foreground hover:text-primary ml-3">
            ← Return to Dashboard
          </a>
        </div>
      )}
      <Navigation />
      <AlbumViewer album={data.album} photos={data.photos} />
    </div>
  );
}



