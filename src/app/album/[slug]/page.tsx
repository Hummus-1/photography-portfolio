import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/navigation";
import { AlbumViewer } from "@/components/album-viewer";
import { notFound } from "next/navigation";
import { Album, Photo } from "@/lib/types";
import { MOCK_ALBUMS_MAP } from "@/lib/mock-data";

async function getAlbumData(slug: string) {
  // Try to load from database first
  try {
    const { data: album, error: albumError } = await supabase
      .from("albums_with_locations")
      .select("*")
      .eq("slug", slug)
      .single();

    if (albumError || !album) {
      // Return mock if database returns error or empty (which happens before DB setup is complete)
      if (MOCK_ALBUMS_MAP[slug]) {
        return MOCK_ALBUMS_MAP[slug];
      }
      return null;
    }

    const { data: photos, error: photosError } = await supabase
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
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params;
  const data = await getAlbumData(slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-400">
      <Navigation />
      <AlbumViewer album={data.album} photos={data.photos} />
    </div>
  );
}

