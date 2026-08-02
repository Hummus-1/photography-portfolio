"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, ArrowDown, Aperture } from "lucide-react";
import { Album } from "@/lib/types";
import { GoldenRatioHeroAnimation } from "@/components/home/golden-ratio-hero-animation";

import { HoverEffectMode } from "./home-view";

interface HeroShowcaseProps {
  featuredAlbums?: Album[];
  hoverEffect?: HoverEffectMode;
}

export function HeroShowcase({ featuredAlbums = [], hoverEffect = "focus" }: HeroShowcaseProps) {
  const handleScrollToCollections = () => {
    const el = document.getElementById("featured-collections");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full border-b border-foreground/10 bg-foreground/[0.01] overflow-hidden pt-16 md:pt-24">
      {/* Hairline Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--foreground-rgb),0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--foreground-rgb),0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        
        {/* Sleek Numbered Eyebrow Line */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center pb-4 justify-between border-b border-foreground/10 text-xs font-mono tracking-widest uppercase text-foreground/60"
        >
          <div className="flex items-center gap-2 text-film-amber font-bold">
            <Aperture className="h-4 w-4 shrink-0" />
            <span>01 — Visual Journal</span>
          </div>
          <span className="text-[11px] text-foreground/50 tracking-widest hidden sm:block">
            Geometry & Composition
          </span>
        </motion.div>

        {/* Main Grid: Typography & Golden Ratio Animation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left Column: Title & Copy (6 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-6 space-y-6 sm:space-y-8 py-16 md:py-24"
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

          {/* Right Column: Golden Ratio Animation Showcase (6 Cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 relative flex items-center justify-center"
          >
            <GoldenRatioHeroAnimation />
          </motion.div>

        </div>

      </div>
    </section>
  );
}

