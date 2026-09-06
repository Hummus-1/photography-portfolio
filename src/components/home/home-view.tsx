"use client";

import { useState } from "react";
import { HeroShowcase } from "@/components/home/hero-showcase";
import { HomeCollections, AlbumWithPhotos } from "@/components/home/home-collections";
import { SpatialAtlasTeaser } from "@/components/home/spatial-atlas-teaser";
import { CuratorialManifesto } from "@/components/home/curatorial-manifesto";
import { Aperture, Camera, Eye, Flame, Layers, Sparkles, X } from "lucide-react";

export type HoverEffectMode = "standard" | "focus" | "rangefinder" | "safelight" | "slide";

interface HomeViewProps {
  featuredAlbums: AlbumWithPhotos[];
}

export function HomeView({ featuredAlbums }: HomeViewProps) {
  const [hoverEffect, setHoverEffect] = useState<HoverEffectMode>("focus");
  const [isMinimized, setIsMinimized] = useState(false);

  const options: { id: HoverEffectMode; label: string; icon: React.ReactNode; badge: string }[] = [
    { id: "focus", label: "Lens Focus", icon: <Camera className="h-3.5 w-3.5" />, badge: "Shutter Flash" },
    { id: "rangefinder", label: "Viewfinder", icon: <Eye className="h-3.5 w-3.5" />, badge: "35mm Reticle" },
    { id: "safelight", label: "Safelight", icon: <Flame className="h-3.5 w-3.5" />, badge: "Darkroom Bloom" },
    { id: "slide", label: "35mm Slide", icon: <Layers className="h-3.5 w-3.5" />, badge: "3D Mount Lift" },
    { id: "standard", label: "Standard", icon: <Sparkles className="h-3.5 w-3.5" />, badge: "Classic Zoom" },
  ];

  return (
    <div className="relative">
      {/* Floating Temporal Hover Animation Switcher */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-background/90 border border-primary/40 shadow-2xl backdrop-blur-xl text-xs font-mono uppercase tracking-widest text-primary font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer group"
          >
            <Aperture className="h-4 w-4 animate-spin-slow" />
            <span>Hover FX: {options.find((o) => o.id === hoverEffect)?.label}</span>
          </button>
        ) : (
          <div className="p-2 rounded-2xl md:rounded-full bg-background/95 border border-foreground/20 shadow-2xl backdrop-blur-2xl flex flex-col md:flex-row items-center gap-2 max-w-[95vw]">
            
            {/* Pill Header Label */}
            <div className="flex items-center justify-between w-full md:w-auto px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-foreground/60 border-b md:border-b-0 md:border-r border-foreground/15 pr-3">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <Aperture className="h-3.5 w-3.5" />
                <span>Hover Animation Tester</span>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="md:hidden text-foreground/50 hover:text-foreground p-1"
                aria-label="Minimize toggle bar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mode Option Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1 px-1">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setHoverEffect(opt.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl md:rounded-full text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    hoverEffect === opt.id
                      ? "bg-primary text-white font-bold shadow-md shadow-primary/25 scale-[1.02]"
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Close / Minimize Button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="hidden md:flex text-foreground/40 hover:text-foreground p-1.5 rounded-full hover:bg-foreground/10 transition-colors ml-1"
              title="Minimize panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Homepage Sections passing hoverEffect */}
      <HeroShowcase featuredAlbums={featuredAlbums} hoverEffect={hoverEffect} />
      <HomeCollections albums={featuredAlbums} hoverEffect={hoverEffect} />
      {/* <SpatialAtlasTeaser albums={featuredAlbums} />
      <CuratorialManifesto /> */}
    </div>
  );
}
