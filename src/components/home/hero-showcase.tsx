"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Sparkles, MapPin, Layers, Camera, ArrowDown, ChevronRight } from "lucide-react";
import { Album } from "@/lib/types";

interface HeroShowcaseProps {
  featuredAlbums: Album[];
  totalPhotosCount?: number;
  locationsCount?: number;
}

export function HeroShowcase({
  featuredAlbums,
  totalPhotosCount = 48,
  locationsCount = 12,
}: HeroShowcaseProps) {
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
    <section className="relative w-full border-b border-foreground/10 bg-foreground/[0.015] overflow-hidden">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--foreground-rgb),0.03)_0%,transparent_65%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-16 space-y-12">
        {/* Top Eyebrow Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/10 pb-6 text-xs font-mono tracking-widest uppercase text-foreground/60"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-foreground/80" />
            <span>Curated Stills & Visual Portfolio</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden sm:inline-block text-foreground/40">•</span>
            <span className="text-foreground/70">Volcanic Landmasses & Arctic Series</span>
          </div>
        </motion.div>

        {/* Main Split Grid: Text & Dynamic Photo Reel Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Subtitle & Action Buttons (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="space-y-4">
              <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] text-foreground">
                Daniel García
                <br />
                <span className="opacity-45 font-normal italic">Visual Creator.</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl font-sans text-foreground/75 leading-relaxed max-w-2xl pt-2">
                A selective journal documenting landscapes, architectural studies, and remote expedition series from Tenerife, Greenland, Iceland, and beyond.
              </p>
            </div>

            {/* Quick Navigation Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleScrollToCollections}
                className="inline-flex items-center gap-2.5 bg-foreground text-background px-6 py-3.5 rounded-full text-xs font-mono uppercase tracking-widest font-semibold hover:opacity-90 transition-all shadow-md cursor-pointer group"
              >
                <span>View Collections</span>
                <ArrowDown className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <Link
                href="/destinations"
                className="inline-flex items-center gap-2.5 border border-foreground/30 hover:border-foreground px-6 py-3.5 rounded-full text-xs font-mono uppercase tracking-widest font-semibold hover:bg-foreground/5 transition-all"
              >
                <Globe className="h-4 w-4 text-foreground/70" />
                <span>Geographic Index</span>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Dynamic Interactive Showcase Card (5 Cols) */}
          {currentAlbum && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-3xl overflow-hidden border border-foreground/15 shadow-2xl bg-background/80 backdrop-blur-sm group">
                
                {/* Hero Showcase Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-foreground/5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentAlbum.id}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Top Badge on Card */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-widest border border-white/20 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Featured Series
                    </span>
                  </div>

                  {/* Card Bottom Meta overlay */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1 text-white">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-white/80">
                      <MapPin className="h-3 w-3 text-white/90" />
                      <span>{currentAlbum.location || "Earth"}</span>
                    </div>
                    <Link
                      href={`/album/${currentAlbum.slug}`}
                      className="group/link inline-flex items-center gap-2"
                    >
                      <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover/link:underline underline-offset-4 decoration-white/40">
                        {currentAlbum.title}
                      </h3>
                      <ChevronRight className="h-4 w-4 text-white/80 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Hero Showcase Controls & Pagination Indicators */}
                {featuredAlbums.length > 1 && (
                  <div className="p-3 bg-background/90 border-t border-foreground/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest pl-2">
                      0{activeIndex + 1} / 0{featuredAlbums.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {featuredAlbums.map((album, idx) => (
                        <button
                          key={album.id}
                          onClick={() => setActiveIndex(idx)}
                          aria-label={`Show ${album.title}`}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === activeIndex
                              ? "w-6 bg-foreground"
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

        {/* Live Metrics Ticker Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-6 border-t border-foreground/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-foreground/70"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-foreground/5 border border-foreground/10">
              <Layers className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <div className="font-serif text-xl font-bold text-foreground">
                {featuredAlbums.length}+
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">
                Curated Series
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-foreground/5 border border-foreground/10">
              <Globe className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <div className="font-serif text-xl font-bold text-foreground">
                {locationsCount}+
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">
                Destinations
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-foreground/5 border border-foreground/10">
              <Camera className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <div className="font-serif text-xl font-bold text-foreground">
                {totalPhotosCount}+
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">
                High-Res Stills
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-foreground/5 border border-foreground/10">
              <Sparkles className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <div className="font-serif text-xl font-bold text-foreground">
                Color Thief
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">
                Extracted Palettes
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
