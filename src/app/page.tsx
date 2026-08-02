/* Hallmark · macrostructure: Specimen · theme: Atelier · genre: editorial · nav: N5 Floating pill · footer: Ft5 Statement */

import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/navigation";
import { MOCK_ALBUMS_LIST } from "@/lib/mock-data";
import { HeroShowcase } from "@/components/home/hero-showcase";
import { HomeCollections, AlbumWithPhotos } from "@/components/home/home-collections";
import { SpatialAtlasTeaser } from "@/components/home/spatial-atlas-teaser";
import { CuratorialManifesto } from "@/components/home/curatorial-manifesto";
import Link from "next/link";
import { Globe, ArrowUpRight } from "lucide-react";

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
          tags,
          exif
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
            tags,
            exif
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-400 selection:bg-film-amber selection:text-white">
      {/* Navigation Bar */}
      <Navigation />

      {/* 01 / INTRODUCTION - Hero Welcome & Photography Showcase */}
      <HeroShowcase featuredAlbums={featuredAlbums} />

      {/* 02 / EXHIBITION SERIES - Curated Collections Diptych */}
      <HomeCollections albums={featuredAlbums} />

      {/* 03 / SPATIAL INDEX - Spatial Locations */}
      <SpatialAtlasTeaser albums={featuredAlbums} />

      {/* 04 / ARTIST STATEMENT - Visual Notes */}
      <CuratorialManifesto />

      {/* 05 / COLOPHON - Footer */}
      <footer className="w-full py-20 px-6 md:px-12 border-t border-foreground/10 bg-background relative">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-baseline">
            <div className="md:col-span-3 flex items-center gap-3 text-xs font-mono tracking-widest uppercase text-foreground/50">
              <span className="text-film-amber font-bold">05</span>
              <span className="w-6 h-px bg-foreground/20" />
              <span>Colophon</span>
            </div>

            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-widest text-film-amber font-semibold">
                  Navigation
                </div>
                <ul className="space-y-2 text-xs font-mono uppercase tracking-widest">
                  <li>
                    <Link href="/" className="hover:text-film-amber transition-colors">
                      Exhibition Gallery
                    </Link>
                  </li>
                  <li>
                    <Link href="/destinations" className="hover:text-film-amber transition-colors">
                      Spatial Index
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-it-works" className="hover:text-film-amber transition-colors">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-film-amber transition-colors">
                      About & Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-widest text-film-amber font-semibold">
                  Medium & Craft
                </div>
                <ul className="space-y-2 text-xs font-mono uppercase tracking-widest text-foreground/70">
                  <li>Typography: Playfair / Geist</li>
                  <li>Tones: Natural Chiaroscuro</li>
                  <li>Pacing: Lenis Inertia Scroll</li>
                  <li>Archives: Geographic Index</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-widest text-film-amber font-semibold">
                  Personal Site
                </div>
                <div>
                  <a
                    href="https://www.danigh.dev/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest border-b border-foreground/30 hover:border-film-amber hover:text-film-amber transition-colors"
                  >
                    <span>danigh.dev</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono uppercase tracking-widest text-foreground/40">
            <div>© {new Date().getFullYear()} Daniel García. All Rights Reserved.</div>
            <div className="flex items-center gap-2 text-[10px]">
              <Globe className="h-3.5 w-3.5 text-film-amber" />
              <span>Personal Photography Portfolio</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
