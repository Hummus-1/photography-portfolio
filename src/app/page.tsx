import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, ArrowRight, Compass, Sparkles, Globe, Layers } from "lucide-react";
import { Album } from "@/lib/types";
import { MOCK_ALBUMS_LIST } from "@/lib/mock-data";
import { ColorPalettePill } from "@/components/color-palette-pill";

export const metadata = {
  title: "Daniel García | Photography & Visual Portfolio",
  description: "Curated photography collections documenting landscapes, architectural studies, and travel series.",
};

export const dynamic = "force-dynamic";

async function getFeaturedAlbums() {
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
      .eq("is_featured", true)
      .order("date", { ascending: false });

    // Fallback: If no album is explicitly marked featured, fetch top published albums
    if (error || !data || data.length === 0) {
      const { data: fallbackData } = await supabase
        .from("albums_with_locations")
        .select(`
          *,
          photos (
            url,
            color_palette
          )
        `)
        .eq("is_published", true)
        .order("date", { ascending: false })
        .limit(3);

      if (!fallbackData || fallbackData.length === 0) {
        return MOCK_ALBUMS_LIST.filter((a) => a.is_featured || a.is_published);
      }
      return processAlbumPhotos(fallbackData);
    }

    return processAlbumPhotos(data);
  } catch {
    return MOCK_ALBUMS_LIST.filter((a) => a.is_featured || a.is_published);
  }
}

function processAlbumPhotos(data: any[]): Album[] {
  return data.map((album: any) => {
    const photos = album.photos || [];
    const coverPhoto = photos.find((p: any) => p.url === album.cover_image_url);
    const cover_color_palette = coverPhoto ? coverPhoto.color_palette : (photos[0]?.color_palette || []);
    return {
      ...album,
      cover_color_palette,
    } as Album;
  });
}

export default async function HomePage() {
  const featuredAlbums = await getFeaturedAlbums();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-400">
      <Navigation />

      {/* Hero Welcome Section */}
      <section className="px-6 md:px-12 py-20 md:py-28 w-full border-b border-foreground/10 bg-foreground/[0.01]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-foreground/50">
            <Sparkles className="h-3.5 w-3.5 text-foreground/70" />
            <span>Curated Stills & Visual Portfolio</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <h1 className="font-serif text-5xl md:text-8xl font-bold tracking-tight leading-none text-foreground">
                Daniel García
                <br />
                <span className="opacity-50 font-normal italic">Creator.</span>
              </h1>
              <p className="text-lg md:text-xl font-sans text-foreground/80 leading-relaxed pt-2">
                A selective journal documenting landscapes, volcanic landmasses, and creative series from Tenerife, the Arctic, and beyond.
              </p>
            </div>

            {/* Quick Navigation Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest font-semibold hover:opacity-90 transition-all shadow-md"
              >
                <Globe className="h-4 w-4" />
                <span>Geographic Index</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Featured Case Studies Section */}
      <section className="w-full">
        <div className="px-6 md:px-12 py-8 max-w-6xl mx-auto flex items-center justify-between border-b border-foreground/10 text-xs font-mono uppercase tracking-widest text-foreground/50">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-foreground/70" />
            <span>Curated Homepage Feature ({featuredAlbums.length} Collections)</span>
          </div>
          <span className="hidden sm:inline">Handpicked Series</span>
        </div>

        {featuredAlbums.map((album, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={album.id}
              className={`w-full border-b border-foreground/10 py-16 md:py-24 flex items-center justify-center transition-colors duration-300 ${
                isEven ? "bg-foreground/[0.015]" : "bg-transparent"
              }`}
            >
              <div className="px-6 md:px-12 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Text details (5 cols) */}
                <div className={`space-y-6 lg:col-span-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                  <div className="flex items-center gap-4 text-xs font-mono tracking-widest uppercase text-foreground/60 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(album.date)}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {album.location_path && album.location_path.length > 0 ? (
                        <span>
                          {album.location_path.length >= 2 ? (
                            `${album.location_path[album.location_path.length - 1].name}, ${
                              album.location_path.find(n => n.type === 'country')?.name || album.location_path[0].name
                            }`
                          ) : (
                            album.location_path[0].name
                          )}
                        </span>
                      ) : (
                        album.location
                      )}
                    </span>
                  </div>

                  <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                    {album.title}
                  </h2>

                  <ColorPalettePill colors={album.cover_color_palette} />

                  <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                    {album.description}
                  </p>

                  {album.tags && album.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-widest text-foreground/50 pt-2">
                      {album.tags.slice(0, 4).map((tag, tIdx) => (
                        <span key={tIdx} className="border border-foreground/10 px-2 py-0.5 bg-foreground/[0.01]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-4">
                    <Link
                      href={`/album/${album.slug}`}
                      className="inline-flex items-center gap-2 group border-b border-foreground/30 pb-1 text-xs font-mono uppercase tracking-widest hover:border-foreground transition-all duration-300"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>

                {/* Hero Case Image (7 cols) */}
                <div className={`lg:col-span-7 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                  <Link href={`/album/${album.slug}`} className="block relative overflow-hidden group aspect-[16/10] bg-foreground/5 rounded-3xl">
                    <Image
                      src={album.cover_image_url || "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=1600"}
                      alt={album.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 900px"
                      priority={index === 0}
                      className="object-cover scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out rounded-2xl"
                    />
                    <div className="absolute inset-0 group-hover:bg-black/10 transition-colors duration-300" />
                  </Link>
                </div>

              </div>
            </div>
          );
        })}
      </section>

      {/* Destinations Teaser Banner */}
      <section className="px-6 md:px-12 py-20 bg-foreground/[0.02] border-b border-foreground/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono uppercase tracking-widest text-foreground/50">
              <Compass className="h-4 w-4" />
              <span>Full Geographic Taxonomy</span>
            </div>
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Explore All Destinations & Spatial Atlas
            </h3>
            <p className="text-sm font-sans text-foreground/70 max-w-xl">
              Browse photo series organized by continents, countries, islands, and real latitude/longitude map coordinates.
            </p>
          </div>

          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 border border-foreground/30 hover:border-foreground px-6 py-3.5 rounded-full text-xs font-mono uppercase tracking-widest font-semibold hover:bg-foreground hover:text-background transition-all"
          >
            <span>Open Destinations Index</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

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
