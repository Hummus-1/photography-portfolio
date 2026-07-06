import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { Album } from "@/lib/types";
import { MOCK_ALBUMS_LIST } from "@/lib/mock-data";

async function getPublishedAlbums() {
  try {
    const { data, error } = await supabase
      .from("albums_with_locations")
      .select("*")
      .eq("is_published", true)
      .order("date", { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_ALBUMS_LIST;
    }
    return data as Album[];
  } catch {
    return MOCK_ALBUMS_LIST;
  }
}

export default async function HomePage() {
  const albums = await getPublishedAlbums();

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
      <section className="px-6 md:px-12 py-20 md:py-32 max-w-[1800px] mx-auto w-full">
        <div className="max-w-4xl space-y-6">
          <div className="text-xs font-mono tracking-widest uppercase text-foreground/50">
            stills portfolio
          </div>
          <h1 className="font-serif text-5xl md:text-8xl font-bold tracking-tight leading-none text-foreground">
            Giulia Gartner
            <br />
            <span className="opacity-55 font-normal italic">Inspired.</span>
          </h1>
          <p className="text-lg md:text-xl font-sans text-foreground/80 leading-relaxed max-w-2xl pt-4">
            A visual journal documenting landscapes, cultures, and quiet moments from around the world.
          </p>
        </div>
      </section>

      {/* Case Studies Portfolio list */}
      <section className="w-full border-t border-foreground/10">
        {albums.map((album, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={album.id}
              className={`w-full border-b border-foreground/10 py-16 md:py-24 flex items-center justify-center transition-colors duration-300 ${
                isEven ? "bg-foreground/[0.01]" : "bg-transparent"
              }`}
            >
              <div className="mx-auto max-w-[1800px] px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Text details (5 cols) */}
                <div className={`space-y-6 lg:col-span-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                  <div className="flex items-center gap-4 text-xs font-mono tracking-widest uppercase text-foreground/60">
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
                  <Link href={`/album/${album.slug}`} className="block relative overflow-hidden group aspect-[16/10] bg-foreground/5">
                    <Image
                      src={album.cover_image_url || "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=1600"}
                      alt={album.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 900px"
                      priority={index === 0}
                      className="object-cover scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                  </Link>
                </div>

              </div>
            </div>
          );
        })}
      </section>

      {/* Minimal Footer */}
      <footer className="mt-auto py-16 px-6 md:px-12 border-t border-foreground/10 text-center text-xs font-mono tracking-widest uppercase text-foreground/40">
        <div>© {new Date().getFullYear()} Stills. All Rights Reserved.</div>
        <div className="mt-2 text-[10px]">Inspired by Giulia Gartner</div>
      </footer>
    </div>
  );
}
