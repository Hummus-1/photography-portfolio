import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/navigation";
import { DestinationsClient } from "@/components/destinations-client";
import { Album } from "@/lib/types";
import { MOCK_ALBUMS_LIST } from "@/lib/mock-data";

export const metadata = {
  title: "Destinations & Locations | Daniel García Photography",
  description: "Browse photo collections by continent, country, island, and specific geographic spots around the world.",
};

export const dynamic = "force-dynamic";

async function getAlbumsWithLocations() {
  try {
    const { data, error } = await supabase
      .from("albums_with_locations")
      .select(`
        *,
        photos (
          url,
          color_palette
        )
      `)
      .eq("is_published", true)
      .order("date", { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_ALBUMS_LIST;
    }

    return data.map((album: any) => {
      const photos = album.photos || [];
      const coverPhoto = photos.find((p: any) => p.url === album.cover_image_url);
      const cover_color_palette = coverPhoto ? coverPhoto.color_palette : (photos[0]?.color_palette || []);
      return {
        ...album,
        cover_color_palette,
      } as Album;
    });
  } catch {
    return MOCK_ALBUMS_LIST;
  }
}

export default async function DestinationsPage() {
  const albums = await getAlbumsWithLocations();

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-400">
      <Navigation />
      <DestinationsClient albums={albums} />
      <footer className="mt-auto py-16 px-6 md:px-12 border-t border-foreground/10 text-center text-xs font-mono tracking-widest uppercase text-foreground/40 space-y-2">
        <div>© {new Date().getFullYear()} Daniel García. All Rights Reserved.</div>
        <div className="text-[10px]">Software Engineer & Visual Creator</div>
      </footer>
    </div>
  );
}
