import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

interface Album {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  date: string;
  cover_image_url: string | null;
  is_published: boolean;
}

// Fallback mockup data so the portfolio looks gorgeous and premium out of the box
const MOCK_ALBUMS: Album[] = [
  {
    id: "mock-1",
    title: "Visit Greenland",
    slug: "visit-greenland",
    description: "Commissioned by Visit Greenland, this collection captures the essence of Greenland's breathtaking glaciers, iceberg-filled fjords, and vibrant cultural heritage.",
    location: "Greenland",
    date: "2023-03-15",
    cover_image_url: "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=1600",
    is_published: true,
  },
  {
    id: "mock-2",
    title: "Inspired by Iceland",
    slug: "inspired-by-iceland",
    description: "An exploration of Iceland's raw volcanic landscapes, towering waterfalls, and moody black sand beaches under the midnight sun.",
    location: "Iceland",
    date: "2024-06-20",
    cover_image_url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1600",
    is_published: true,
  },
  {
    id: "mock-3",
    title: "Follow the Tracks",
    slug: "follow-the-tracks",
    description: "Documenting the nomadic lifestyle and endless steppes of Mongolia, following the tracks of ancient horse cultures.",
    location: "Mongolia",
    date: "2025-09-05",
    cover_image_url: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=1600",
    is_published: true,
  },
];

async function getPublishedAlbums() {
  try {
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .eq("is_published", true)
      .order("date", { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_ALBUMS;
    }
    return data as Album[];
  } catch {
    return MOCK_ALBUMS;
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
                      {album.location}
                    </span>
                  </div>

                  <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                    {album.title}
                  </h2>

                  <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                    {album.description}
                  </p>

                  <div className="pt-4">
                    <Link
                      href={`/album/${album.slug}`}
                      className="inline-flex items-center gap-2 group border-b border-foreground/30 pb-1 text-xs font-mono uppercase tracking-widest hover:border-foreground transition-all duration-300 cursor-none"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>

                {/* Hero Case Image (7 cols) */}
                <div className={`lg:col-span-7 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                  <Link href={`/album/${album.slug}`} className="block relative overflow-hidden group aspect-[16/10] bg-foreground/5 cursor-none">
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
