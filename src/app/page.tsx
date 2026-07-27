import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/navigation";
import { MOCK_ALBUMS_LIST } from "@/lib/mock-data";
import { HeroShowcase } from "@/components/home/hero-showcase";
import { HomeCollections, AlbumWithPhotos } from "@/components/home/home-collections";
import { SpatialAtlasTeaser } from "@/components/home/spatial-atlas-teaser";

export const metadata = {
  title: "Daniel García | Photography & Visual Portfolio",
  description: "Curated photography collections documenting landscapes, architectural studies, and travel series.",
};

export const dynamic = "force-dynamic";

async function getFeaturedAlbums(): Promise<AlbumWithPhotos[]> {
  try {
    const { data, error } = await supabase
      .from("albums_with_locations")
      .select(`
        *,
        photos (
          id,
          url,
          thumbnail_url,
          color_palette,
          aspect_ratio,
          location,
          tags
        )
      `)
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("date", { ascending: false });

    // Fallback: If no album is explicitly marked featured, fetch top published albums
    if (error || !data || data.length === 0) {
      const { data: fallbackData } = await supabase
        .from("albums_with_locations")
        .select(`
          *,
          photos (
            id,
            url,
            thumbnail_url,
            color_palette,
            aspect_ratio,
            location,
            tags
          )
        `)
        .eq("is_published", true)
        .order("date", { ascending: false })
        .limit(6);

      if (!fallbackData || fallbackData.length === 0) {
        return MOCK_ALBUMS_LIST as AlbumWithPhotos[];
      }
      return processAlbumPhotos(fallbackData);
    }

    return processAlbumPhotos(data);
  } catch {
    return MOCK_ALBUMS_LIST as AlbumWithPhotos[];
  }
}

function processAlbumPhotos(data: any[]): AlbumWithPhotos[] {
  return data.map((album: any) => {
    const photos = album.photos || [];
    const coverPhoto = photos.find((p: any) => p.url === album.cover_image_url);
    const cover_color_palette = coverPhoto ? coverPhoto.color_palette : (photos[0]?.color_palette || []);
    return {
      ...album,
      photos,
      cover_color_palette,
    } as AlbumWithPhotos;
  });
}

export default async function HomePage() {
  const featuredAlbums = await getFeaturedAlbums();

  // Calculate stats for ticker
  const totalPhotosCount = featuredAlbums.reduce(
    (acc, album) => acc + (album.photos?.length || 12),
    0
  );
  const locationsCount = new Set(
    featuredAlbums.map((a) => a.location || a.country_code || a.id)
  ).size + 8;

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-400">
      <Navigation />

      {/* Hero Welcome & Photography Reel Showcase */}
      <HeroShowcase
        featuredAlbums={featuredAlbums}
        totalPhotosCount={totalPhotosCount}
        locationsCount={locationsCount}
      />

      {/* Featured Case Studies / Collections Section with Tag Filters */}
      <HomeCollections albums={featuredAlbums} />

      {/* Spatial Destinations & Coordinates Atlas Teaser */}
      <SpatialAtlasTeaser albums={featuredAlbums} />

      {/* Footer */}
      <footer className="mt-auto py-16 px-6 md:px-12 border-t border-foreground/10 text-center text-xs font-mono tracking-widest uppercase text-foreground/40 space-y-2">
        <div>© {new Date().getFullYear()} Daniel García. All Rights Reserved.</div>
        <div className="text-[10px]">Software Engineer & Visual Creator</div>
        <div className="pt-2">
          <a
            href="https://www.danigh.dev/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors duration-300 border-b border-foreground/20 hover:border-foreground"
          >
            danigh.dev
          </a>
        </div>
      </footer>
    </div>
  );
}
