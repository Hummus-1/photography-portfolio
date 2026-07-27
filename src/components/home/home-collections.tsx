"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, ArrowRight, Layers, Images, Sparkles } from "lucide-react";
import { Album, Photo } from "@/lib/types";
import { ColorPalettePill } from "@/components/color-palette-pill";

export interface AlbumWithPhotos extends Album {
  photos?: Photo[];
}

interface HomeCollectionsProps {
  albums: AlbumWithPhotos[];
}

export function HomeCollections({ albums }: HomeCollectionsProps) {
  const formatDate = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return dateStr;
      return dateObj.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section id="featured-collections" className="w-full py-12">
      {/* Header Bar */}
      <div className="px-6 md:px-12 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-foreground/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-foreground/5 border border-foreground/10">
              <Layers className="h-4 w-4 text-foreground/80" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Featured Collections
              </h2>
              <p className="text-xs font-mono text-foreground/50 uppercase tracking-widest pt-0.5">
                Curated Series ({albums.length} Collections)
              </p>
            </div>
          </div>
          <span className="hidden sm:inline text-xs font-mono uppercase tracking-widest text-foreground/40">
            Handpicked Series
          </span>
        </div>
      </div>

      {/* Featured Collections List */}
      <div className="divide-y divide-foreground/10 pt-4">
        <AnimatePresence mode="popLayout">
          {albums.map((album, index) => {
            const isEven = index % 2 === 0;
            const primaryColor = album.cover_color_palette?.[0] || "#888888";
            const photosPreview = album.photos ? album.photos.slice(0, 3) : [];

            return (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`w-full py-16 md:py-24 flex items-center justify-center transition-colors duration-300 relative group/section ${
                  isEven ? "bg-foreground/[0.01]" : "bg-transparent"
                }`}
              >
                {/* Background Ambient Glow derived from primary color */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover/section:opacity-100 transition-opacity duration-700 blur-3xl -z-10"
                  style={{
                    background: `radial-gradient(circle at ${isEven ? "70% 50%" : "30% 50%"}, ${primaryColor}15 0%, transparent 60%)`,
                  }}
                />

                <div className="px-6 md:px-12 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left/Right Text Details (5 cols) */}
                  <div className={`space-y-6 lg:col-span-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                    
                    {/* Metadata Header */}
                    <div className="flex items-center gap-3 text-xs font-mono tracking-widest uppercase text-foreground/60 flex-wrap">
                      <span className="flex items-center gap-1 bg-foreground/5 border border-foreground/10 px-2.5 py-1 rounded-md">
                        <Calendar className="h-3 w-3" />
                        {formatDate(album.date)}
                      </span>
                      <span className="flex items-center gap-1 bg-foreground/5 border border-foreground/10 px-2.5 py-1 rounded-md">
                        <MapPin className="h-3 w-3 text-emerald-500/80" />
                        {album.location_path && album.location_path.length > 0 ? (
                          <span>
                            {album.location_path.length >= 2 ? (
                              `${album.location_path[album.location_path.length - 1].name}, ${
                                album.location_path.find((n) => n.type === "country")?.name || album.location_path[0].name
                              }`
                            ) : (
                              album.location_path[0].name
                            )}
                          </span>
                        ) : (
                          album.location || "Earth"
                        )}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/album/${album.slug}`} className="block group/title">
                      <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground group-hover/title:text-foreground/80 transition-colors leading-tight">
                        {album.title}
                      </h3>
                    </Link>

                    {/* Color Palette Pill */}
                    {album.cover_color_palette && (
                      <ColorPalettePill colors={album.cover_color_palette} />
                    )}

                    {/* Description */}
                    <p className="text-foreground/80 leading-relaxed text-sm md:text-base font-sans">
                      {album.description}
                    </p>

                    {/* Tags */}
                    {album.tags && album.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-widest text-foreground/60 pt-1">
                        {album.tags.slice(0, 5).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="border border-foreground/15 px-2.5 py-0.5 rounded-full bg-background/50 backdrop-blur-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA Button & Shot count */}
                    <div className="pt-4 flex items-center justify-between gap-4 border-t border-foreground/10">
                      <Link
                        href={`/album/${album.slug}`}
                        className="inline-flex items-center gap-2 group/btn border-b-2 border-foreground/40 hover:border-foreground pb-1 text-xs font-mono uppercase tracking-widest font-semibold transition-all duration-300"
                      >
                        <span>Explore Collection</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </Link>

                      {album.photos && album.photos.length > 0 && (
                        <span className="text-[11px] font-mono text-foreground/50 flex items-center gap-1.5">
                          <Images className="h-3.5 w-3.5" />
                          {album.photos.length} Photos
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Right/Left Image Showcase Container with Thumbnails (7 cols) */}
                  <div className={`lg:col-span-7 space-y-4 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                    
                    {/* Main Cover Image */}
                    <Link
                      href={`/album/${album.slug}`}
                      className="block relative overflow-hidden group/img aspect-[16/10] bg-foreground/5 rounded-3xl border border-foreground/10 shadow-xl"
                    >
                      <Image
                        src={album.cover_image_url || "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=1600"}
                        alt={album.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 850px"
                        priority={index === 0}
                        className="object-cover scale-100 group-hover/img:scale-[1.03] transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <span className="text-white text-xs font-mono uppercase tracking-widest flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                          Click to enter series
                        </span>
                      </div>
                    </Link>

                    {/* Thumbnail Strip Preview (if photos array exists) */}
                    {photosPreview.length > 1 && (
                      <div className="grid grid-cols-3 gap-3">
                        {photosPreview.map((photo, pIdx) => (
                          <Link
                            key={photo.id || pIdx}
                            href={`/album/${album.slug}`}
                            className="relative aspect-[3/2] rounded-xl overflow-hidden border border-foreground/10 bg-foreground/5 group/thumb"
                          >
                            <Image
                              src={photo.thumbnail_url || photo.url}
                              alt=""
                              fill
                              sizes="(max-width: 768px) 33vw, 250px"
                              className="object-cover group-hover/thumb:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover/thumb:bg-transparent transition-colors" />
                          </Link>
                        ))}
                      </div>
                    )}

                  </div>

                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
