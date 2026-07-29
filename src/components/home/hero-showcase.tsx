"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, MapPin, ArrowDown, ChevronRight, Aperture } from "lucide-react";
import { Album } from "@/lib/types";
import { ColorPalettePill } from "@/components/color-palette-pill";

import { HoverEffectMode } from "./home-view";

interface HeroShowcaseProps {
  featuredAlbums: Album[];
  hoverEffect?: HoverEffectMode;
}

export function HeroShowcase({ featuredAlbums, hoverEffect = "focus" }: HeroShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto rotate hero highlight photo every 6s
  useEffect(() => {
    if (featuredAlbums.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredAlbums.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredAlbums.length]);

  const currentAlbum = featuredAlbums[activeIndex] || featuredAlbums[0];

  const handleScrollToCollections = () => {
    const el = document.getElementById("featured-collections");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full border-b border-foreground/10 bg-foreground/[0.01] overflow-hidden py-16 md:py-24">
      {/* Hairline Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--foreground-rgb),0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--foreground-rgb),0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 space-y-12 relative z-10">
        
        {/* Sleek Numbered Eyebrow Line */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between border-b border-foreground/10 pb-4 text-xs font-mono tracking-widest uppercase text-foreground/60"
        >
          <div className="flex items-center gap-2 text-film-amber font-bold">
            <Aperture className="h-4 w-4 shrink-0" />
            <span>01 — Visual Journal</span>
          </div>
          <span className="text-[11px] text-foreground/50 tracking-widest hidden sm:block">
            Selected Exhibition Archive
          </span>
        </motion.div>

        {/* Main Grid: Typography & Photo Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Title & Copy (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 space-y-6 sm:space-y-8"
          >
            <div className="space-y-4 sm:space-y-6">
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.88] text-foreground">
                Daniel García
                <br />
                <span className="opacity-40 font-normal italic">Visual Journal.</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl font-sans text-foreground/75 leading-relaxed max-w-2xl pt-1">
                A personal archive documenting remote landscapes, architectural geometries, and expedition series across volcanic islands and sub-arctic terrain.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={handleScrollToCollections}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-foreground text-background px-7 py-4 rounded-full text-xs font-mono uppercase tracking-widest font-semibold hover:bg-film-amber hover:text-white active:scale-[0.98] transition-all shadow-md cursor-pointer group"
              >
                <span>View Collections</span>
                <ArrowDown className="h-3.5 w-3.5 group-hover:translate-y-1 transition-transform duration-300" />
              </button>

              <Link
                href="/destinations"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 border border-foreground/25 hover:border-film-amber px-7 py-4 rounded-full text-xs font-mono uppercase tracking-widest font-semibold hover:bg-film-amber/5 active:scale-[0.98] transition-all"
              >
                <Globe className="h-4 w-4 text-foreground/70" />
                <span>Spatial Index</span>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Photo Stage Showcase (5 Cols) */}
          {currentAlbum && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-3xl overflow-hidden border border-foreground/15 shadow-2xl bg-background/80 backdrop-blur-md group">
                
                {/* Hero Showcase Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-foreground/5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentAlbum.id}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={currentAlbum.cover_image_url || "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=1600"}
                        alt={currentAlbum.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 500px"
                        priority
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Top Overlay */}
                  <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                    <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-widest border border-white/20">
                      Featured Series
                    </span>

                    {/* Color Swatches Pill overlay */}
                    {currentAlbum.cover_color_palette && (
                      <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                        <ColorPalettePill colors={currentAlbum.cover_color_palette} size="sm" />
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1.5 text-white">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-white/80">
                      <MapPin className="h-3 w-3 text-film-amber" />
                      <span>{currentAlbum.location || "Earth"}</span>
                    </div>
                    <Link
                      href={`/album/${currentAlbum.slug}`}
                      className="group/link flex items-center justify-between"
                    >
                      <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover/link:text-film-amber transition-colors">
                        {currentAlbum.title}
                      </h3>
                        <ChevronRight className="h-4 w-4 text-white/80 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Showcase Controls & Pagination Bar */}
                {featuredAlbums.length > 1 && (
                  <div className="p-3 bg-background/90 border-t border-foreground/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-foreground/60 uppercase tracking-widest pl-2">
                      Series 0{activeIndex + 1} / 0{featuredAlbums.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {featuredAlbums.map((album, idx) => (
                        <button
                          key={album.id}
                          onClick={() => setActiveIndex(idx)}
                          aria-label={`Show ${album.title}`}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === activeIndex
                              ? "w-6 bg-film-amber"
                              : "w-2 bg-foreground/20 hover:bg-foreground/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

        </div>

      </div>
    </section>
  );
}
