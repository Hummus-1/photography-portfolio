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

    return {
      album: album as Album,
      photos: (photos || []) as Photo[],
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
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-300 px-4 py-2.5 text-xs font-mono text-center flex items-center justify-center gap-2">
          <Eye className="h-4 w-4 text-amber-400 shrink-0" />
          <span>UNPUBLISHED DRAFT PREVIEW — Only visible in admin preview mode</span>
          <a href="/admin" className="underline text-white hover:text-amber-200 ml-3">
            ← Return to Dashboard
          </a>
        </div>
      )}
      <Navigation />
      <AlbumViewer album={data.album} photos={data.photos} />
    </div>
  );
}



