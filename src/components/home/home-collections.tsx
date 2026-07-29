"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, ArrowRight, Images, Sparkles } from "lucide-react";
import { Album, Photo } from "@/lib/types";
import { ColorPalettePill } from "@/components/color-palette-pill";

import { HoverEffectMode } from "./home-view";

export interface AlbumWithPhotos extends Album {
  photos?: Photo[];
}

interface HomeCollectionsProps {
  albums: AlbumWithPhotos[];
  hoverEffect?: HoverEffectMode;
}

export function HomeCollections({ albums, hoverEffect = "focus" }: HomeCollectionsProps) {
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
    <section id="featured-collections" className="w-full py-20 md:py-32 relative">
      {/* Header Bar */}
      <div className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-baseline border-b border-foreground/10 pb-8">
          
          <div className="md:col-span-3 flex items-center gap-3 text-xs font-mono tracking-widest uppercase text-foreground/50">
            <span className="text-film-amber font-bold flex items-center gap-1">
              02
            </span>
            <span className="w-6 h-px bg-foreground/20" />
            <span>Exhibition Series</span>
          </div>

          <div className="md:col-span-9 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Curated Collections
              </h2>
              <p className="text-xs font-mono text-foreground/50 uppercase tracking-widest pt-1.5">
                Expedition Archives ({albums.length} Photo Series)
              </p>
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-foreground/40 hidden sm:block">
              Editorial Diptych Layout
            </span>
          </div>

        </div>
      </div>

      {/* Exhibition Collections Diptych List */}
      <div className="divide-y divide-foreground/10 pt-4">
        <AnimatePresence mode="popLayout">
          {albums.map((album, index) => {
            const isEven = index % 2 === 0;
            const primaryColor = album.cover_color_palette?.[0] || "#d96b27";
            const seriesTag = `SERIES 0${index + 1}`;
            const coverPhoto = album.photos?.find((p) => p.url === album.cover_image_url) || album.photos?.[0];
            const exif = coverPhoto?.exif;
            const exifSpec = [
              exif?.focal_length || "35MM",
              exif?.aperture,
              exif?.shutter,
              exif?.iso ? `ISO ${exif.iso}` : null,
            ].filter(Boolean).join(" • ") || `35MM • EXP 0${index + 1} • ISO 400`;

            return (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`w-full py-20 md:py-28 flex items-center justify-center transition-colors duration-300 relative group/section ${
                  isEven ? "bg-foreground/[0.01]" : "bg-transparent"
                }`}
              >
                {/* Background Ambient Glow derived from extracted color */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover/section:opacity-100 transition-opacity duration-700 blur-3xl -z-10"
                  style={{
                    background: `radial-gradient(circle at ${isEven ? "75% 50%" : "25% 50%"}, ${primaryColor}18 0%, transparent 65%)`,
                  }}
                />

                <div className="px-4 sm:px-6 md:px-12 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                  
                  {/* Text Details Side (5 cols) */}
                  <div className={`space-y-6 lg:col-span-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                    
                    {/* Metadata Header */}
                    <div className="flex items-center gap-3 text-xs font-mono tracking-widest uppercase text-foreground/60 flex-wrap">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-film-amber/10 border border-film-amber/30 text-film-amber font-semibold">
                        {seriesTag}
                      </span>
                      <span className="flex items-center gap-1.5 bg-foreground/5 border border-foreground/10 px-3 py-1 rounded-md">
                        <Calendar className="h-3 w-3 text-foreground/70" />
                        {formatDate(album.date)}
                      </span>
                      <span className="flex items-center gap-1.5 bg-foreground/5 border border-foreground/10 px-3 py-1 rounded-md">
                        <MapPin className="h-3 w-3 text-film-amber" />
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

                    {/* Collection Title */}
                    <Link href={`/album/${album.slug}`} className="block group/title">
                      <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground group-hover/title:text-film-amber transition-colors leading-[1.05]">
                        {album.title}
                      </h3>
                    </Link>

                    {/* Color Swatch Pill */}
                    {album.cover_color_palette && (
                      <ColorPalettePill colors={album.cover_color_palette} />
                    )}

                    {/* Description */}
                    <p className="text-foreground/75 leading-relaxed text-sm md:text-base font-sans">
                      {album.description}
                    </p>

                    {/* Action Button & Photos Count */}
                    <div className="pt-6 flex items-center justify-between gap-4 border-t border-foreground/10">
                      <Link
                        href={`/album/${album.slug}`}
                        className="inline-flex items-center gap-2 group/btn text-xs font-mono uppercase tracking-widest font-semibold border-b-2 border-foreground/30 hover:border-film-amber hover:text-film-amber pb-1 transition-all duration-300"
                      >
                        <span>Open Series</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </Link>

                      {album.photos && album.photos.length > 0 && (
                        <span className="text-[11px] font-mono text-foreground/50 flex items-center gap-1.5">
                          <Images className="h-3.5 w-3.5" />
                          {album.photos.length} Stills
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Image Frame Side (7 cols) */}
                  <div className={`lg:col-span-7 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                    
                    {/* Primary Cover Image Frame with Safelight Bloom Glow */}
                    <div className="p-2 rounded-3xl border border-foreground/15 bg-background/80 shadow-xl backdrop-blur-md transition-all duration-500 group-hover/section:shadow-[0_0_45px_-5px_rgba(217,107,39,0.45)] group-hover/section:border-film-amber/60">
                      <Link
                        href={`/album/${album.slug}`}
                        className="block relative overflow-hidden group/img aspect-[16/10] bg-foreground/5 rounded-2xl"
                      >
                        {/* Pristine Unaltered Default Image -> Subtly Enriched on Hover */}
                        <Image
                          src={album.cover_image_url || "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=1600"}
                          alt={album.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 850px"
                          priority={index === 0}
                          className="object-cover scale-100 group-hover/img:scale-[1.02] group-hover/img:saturate-[1.12] group-hover/img:contrast-[1.05] transition-all duration-700 ease-out"
                        />

                        {/* Rangefinder Viewfinder 35mm Reticle Brackets */}
                        <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-film-amber opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-20 group-hover/img:translate-x-1 group-hover/img:translate-y-1 pointer-events-none" />
                        <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-film-amber opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-20 group-hover/img:-translate-x-1 group-hover/img:translate-y-1 pointer-events-none" />
                        <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-film-amber opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-20 group-hover/img:translate-x-1 group-hover/img:-translate-y-1 pointer-events-none" />
                        <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-film-amber opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-20 group-hover/img:-translate-x-1 group-hover/img:-translate-y-1 pointer-events-none" />

                        {/* Real Photo EXIF Spec Badge */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 text-[9px] font-mono tracking-widest text-white/90 bg-black/80 px-2.5 py-0.5 rounded border border-white/20 uppercase pointer-events-none whitespace-nowrap">
                          {exifSpec}
                        </div>
                      </Link>
                    </div>

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
