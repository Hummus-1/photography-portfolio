"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Calendar, MapPin, ChevronDown, Aperture, Images } from "lucide-react";
import { Album, Photo } from "@/lib/types";
import { ColorPalettePill } from "@/components/color-palette-pill";
import { selectBestAccentColor, selectBestSecondaryColor, getHeroGlowOpacity } from "@/lib/color-utils";

interface HeroProps {
  album: Album;
  photos: Photo[];
  onPhotoSelect: (index: number) => void;
  onExploreClick: () => void;
}

export function Hero({
  album,
  photos,
  onPhotoSelect,
  onExploreClick,
}: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isStageHovered, setIsStageHovered] = useState<boolean>(false);

  // Subtle 3D tilt interaction for cover frame
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 45, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 25 });

  const tiltX = useTransform(springY, [0, 1], [3, -3]);
  const tiltY = useTransform(springX, [0, 1], [-3, 3]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Date pending";
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return dateStr;
      return dateObj.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const coverPhoto = photos.find((p) => p.url === album.cover_image_url) || photos[0];
  const albumPalette = (album.cover_color_palette && album.cover_color_palette.length > 0)
    ? album.cover_color_palette
    : (coverPhoto?.color_palette && coverPhoto.color_palette.length > 0)
    ? coverPhoto.color_palette
    : null;

  const palette = albumPalette && albumPalette.length >= 3
    ? albumPalette
    : [albumPalette?.[0] || "#d96b27", "#1f2937", "#4b5563", "#9ca3af", "#e5e7eb"];

  // Dynamic punchy accent color selection with optional manual hero override & contrast check
  const accentColor = selectBestAccentColor(palette, "#d96b27", album.custom_hero_color);
  const secondaryColor = selectBestSecondaryColor(palette, accentColor);
  const glowOpacity = getHeroGlowOpacity(accentColor, true);

  const displayUrl = coverPhoto?.url || album.cover_image_url || "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=1600";

  const exif = coverPhoto?.exif;
  const exifSpec = [
    exif?.focal_length || "35MM",
    exif?.aperture,
    exif?.shutter,
    exif?.iso ? `ISO ${exif.iso}` : null,
  ].filter(Boolean).join(" • ") || "35MM • f/2.8 • 1/400s • ISO 100";

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        "--hero-accent": accentColor,
        "--hero-secondary": secondaryColor,
        "--hero-glow-opacity": glowOpacity,
      } as React.CSSProperties}
      className="relative w-full min-h-[88vh] lg:min-h-[92vh] bg-background overflow-hidden flex flex-col items-center justify-center border-b border-foreground/10 select-none pt-20 pb-12 transition-colors duration-700"
    >
      {/* Multi-Layer Animated Palette Wave Canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 0.95, 1.15, 1],
            x: ["-10%", "15%", "-5%", "10%", "-10%"],
            y: ["-15%", "10%", "15%", "-10%", "-15%"],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundColor: accentColor, opacity: glowOpacity }}
          className="absolute -top-36 -left-36 w-[650px] h-[650px] rounded-full blur-[140px] transition-all duration-700"
        />

        <motion.div
          animate={{
            scale: [1.15, 0.9, 1.25, 0.95, 1.15],
            x: ["25%", "-15%", "10%", "-20%", "25%"],
            y: ["15%", "-10%", "-15%", "15%", "15%"],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundColor: secondaryColor, opacity: glowOpacity * 0.85 }}
          className="absolute -bottom-36 -right-36 w-[700px] h-[700px] rounded-full blur-[160px] transition-all duration-700"
        />
      </div>

      {/* Main Grid */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center my-auto">
        
        {/* Left Editorial Metadata */}
        <div className="lg:col-span-6 space-y-6">
          {/* Single Sleek Editorial Metadata Line */}
           <div className="flex flex-col gap-2 text-xs font-mono uppercase tracking-widest text-foreground/75">
          <span className="font-bold flex items-center gap-1.5" style={{ color: accentColor }}>
              <Aperture className="h-3.5 w-3.5" />
              Series Exhibition
            </span>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-widest text-foreground/75">
            <span className="font-medium text-foreground/80">{photos.length} Stills</span>
            <span className="text-foreground/30">•</span>
            <span>{formatDate(album.date)}</span>
            <span className="text-foreground/30">•</span>
            <span className="flex items-center gap-1 text-foreground/90 font-medium">
              <MapPin className="h-3.5 w-3.5" style={{ color: accentColor }} />
              {album.location || "Earth"}
            </span>
            </div>
            </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.04]">
            {album.title}
          </h1>

          {palette && palette.length > 0 && (
            <div className="pt-1 flex items-center gap-3">
              <ColorPalettePill colors={palette} size="md" />
            </div>
          )}

          {album.description && (
            <p className="text-foreground/80 leading-relaxed text-base sm:text-lg font-sans max-w-xl">
              {album.description}
            </p>
          )}

          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={onExploreClick}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-foreground text-background text-xs font-mono uppercase tracking-widest font-semibold hover:opacity-95 transition-all shadow-xl cursor-pointer"
            >
              <span>Explore Series Stills</span>
              <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Column: FEATURED ALBUM COVER STAGE WITH HOME PAGE HOVER EFFECT */}
        <div className="lg:col-span-6 relative perspective-1000 flex items-center justify-center p-2">
          
          <motion.div
            style={{
              rotateX: tiltX,
              rotateY: tiltY,
              borderColor: isStageHovered ? `${accentColor}80` : "rgba(255,255,255,0.15)",
              boxShadow: isStageHovered ? `0 0 45px -5px ${accentColor}50` : "0 20px 40px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={() => setIsStageHovered(true)}
            onMouseLeave={() => setIsStageHovered(false)}
            onClick={() => onPhotoSelect(0)}
            className="p-2 rounded-3xl border bg-background/80 shadow-xl backdrop-blur-md transition-all duration-500 w-full aspect-[16/10] overflow-hidden cursor-pointer group/img"
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-foreground/5">
              {/* Cover Photo */}
              <Image
                src={displayUrl}
                alt={album.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 850px"
                className="object-cover scale-100 group-hover/img:scale-[1.02] group-hover/img:saturate-[1.12] group-hover/img:contrast-[1.05] transition-all duration-700 ease-out"
              />

              {/* Rangefinder Viewfinder 35mm Reticle Brackets (Animated on Hover) */}
              <div
                className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-20 group-hover/img:translate-x-1 group-hover/img:translate-y-1 pointer-events-none"
                style={{ borderColor: accentColor }}
              />
              <div
                className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-20 group-hover/img:-translate-x-1 group-hover/img:translate-y-1 pointer-events-none"
                style={{ borderColor: accentColor }}
              />
              <div
                className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-20 group-hover/img:translate-x-1 group-hover/img:-translate-y-1 pointer-events-none"
                style={{ borderColor: accentColor }}
              />
              <div
                className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-20 group-hover/img:-translate-x-1 group-hover/img:-translate-y-1 pointer-events-none"
                style={{ borderColor: accentColor }}
              />

              {/* Real Photo EXIF Spec Film Badge (Revealed on Hover) */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 text-[9px] font-mono tracking-widest text-white/90 bg-black/80 px-2.5 py-0.5 rounded border border-white/20 uppercase pointer-events-none whitespace-nowrap">
                {exifSpec}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
