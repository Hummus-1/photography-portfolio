"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, Camera, MapPin, Calendar } from "lucide-react";
import { Album, Photo } from "@/lib/types";

interface AlbumViewerProps {
  album: Album;
  photos: Photo[];
}

export function AlbumViewer({ album, photos }: AlbumViewerProps) {
  const [activePhotoId, setActivePhotoId] = useState<string>("");
  const photoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    // Set up Intersection Observer to track which photo is currently active on scroll
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -40% 0px", // triggers when image is centered in viewport
      threshold: 0.2,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActivePhotoId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe each photo wrapper
    Object.values(photoRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [photos]);

  const scrollToPhoto = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

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
    <div className="mx-auto max-w-[1800px] px-6 md:px-12 py-12 md:py-20">
      {/* Album Header Block */}
      <header className="mb-20 md:mb-32 max-w-4xl">
        <div className="flex items-center gap-4 text-xs font-mono tracking-widest uppercase text-foreground/60 mb-6">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {formatDate(album.date)}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {album.location}
          </span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
          {album.title}
        </h1>

        <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-3xl mb-8">
          {album.description}
        </p>

        {album.tags && album.tags.length > 0 && (
          <div className="flex flex-wrap gap-2.5 text-xs font-mono uppercase tracking-widest text-foreground/50">
            {album.tags.map((tag, tIdx) => (
              <span key={tIdx} className="border border-foreground/15 px-2.5 py-1 bg-foreground/[0.01]">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Main Layout: Asymmetrical grid and Sticky Thumbnail sidebar */}
      <div className="flex gap-12 lg:gap-24 relative">
        
        {/* Asymmetrical Gallery Grid (Left side) */}
        <div className="flex-grow space-y-32 md:space-y-48">
          {photos.map((photo, index) => {
            // Alternating widths to recreate asymmetric look
            const isWide = index % 3 === 0;
            const isNarrow = index % 3 === 1;

            const widthClass = isWide
              ? "w-full max-w-[1400px]"
              : isNarrow
              ? "w-full lg:w-[70%] mr-auto"
              : "w-full lg:w-[80%] ml-auto";

            return (
              <div
                key={photo.id}
                id={`photo-${photo.id}`}
                ref={(el) => {
                  photoRefs.current[`photo-${photo.id}`] = el;
                }}
                className={`group relative overflow-hidden transition-all duration-500 ${widthClass}`}
              >
                {/* Photo Element */}
                <div
                  className="relative overflow-hidden bg-foreground/5"
                  style={{ aspectRatio: photo.aspect_ratio || 1.5 }}
                >
                  <Image
                    src={photo.url}
                    alt={album.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    priority={index < 2}
                    className="object-cover scale-100 group-hover:scale-[1.02] transition-transform duration-700 ease-out pointer-events-none"
                  />

                  {/* Elegant Dark/Light Glassmorphism overlay showing EXIF + Colors on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 md:p-8">
                    
                    {/* Location Tag */}
                    {photo.location && (
                      <div className="text-[10px] font-mono tracking-widest uppercase text-foreground/60 mb-2 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {photo.location}
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      
                      {/* EXIF Information */}
                      <div className="space-y-2">
                        {photo.exif.camera && (
                          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                            <Camera className="h-4 w-4 opacity-75" />
                            <span>{photo.exif.camera}</span>
                            {photo.exif.lens && (
                              <span className="text-foreground/60 font-normal">
                                • {photo.exif.lens}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs font-mono text-foreground/70">
                          <Sliders className="h-3.5 w-3.5 opacity-75" />
                          <span>
                            {[
                              photo.exif.focal_length,
                              photo.exif.aperture,
                              photo.exif.shutter,
                              photo.exif.iso ? `ISO ${photo.exif.iso}` : null,
                            ]
                              .filter(Boolean)
                              .join("  •  ")}
                          </span>
                        </div>
                      </div>

                      {/* Color Palette Indicators */}
                      {photo.color_palette && photo.color_palette.length > 0 && (
                        <div className="flex items-center gap-2.5">
                          {photo.color_palette.map((color, cIdx) => (
                            <div key={cIdx} className="group/color relative">
                              <div
                                className="h-6 w-6 rounded-full border border-foreground/10 shadow-sm hover:scale-125 transition-transform duration-300"
                                style={{ backgroundColor: color }}
                              />
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-mono py-1 px-2 rounded opacity-0 pointer-events-none group-hover/color:opacity-100 transition-opacity duration-300 tracking-wider">
                                {color}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                {/* Photo tags shown underneath the photo */}
                {photo.tags && photo.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-widest text-foreground/50">
                    {photo.tags.slice(0, 5).map((tag, tIdx) => (
                      <span key={tIdx} className="hover:text-foreground transition-colors duration-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky Thumbnail Navigation Sidebar (Right side, hidden on small screens) */}
        <aside className="hidden lg:block w-24 shrink-0 h-[calc(100vh-160px)] sticky top-28 flex flex-col items-center justify-center">
          <div className="w-px h-16 bg-foreground/10 mb-8" />
          
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] py-4 pr-2 scrollbar-none items-center">
            {photos.map((photo, index) => {
              const isActive = activePhotoId === `photo-${photo.id}`;
              
              return (
                <button
                  key={photo.id}
                  onClick={() => scrollToPhoto(`photo-${photo.id}`)}
                  className={`group relative h-12 w-12 overflow-hidden transition-all duration-300 border ${
                    isActive
                      ? "border-foreground scale-110 opacity-100 z-10"
                      : "border-transparent opacity-30 hover:opacity-70 scale-95"
                  }`}
                  aria-label={`Jump to photo ${index + 1}`}
                >
                  <Image
                    src={photo.thumbnail_url || photo.url}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                  {/* Subtle active status indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTimelineIndicator"
                      className="absolute right-0 top-0 bottom-0 w-[3px] bg-foreground"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="w-px h-16 bg-foreground/10 mt-8" />
          <span className="text-[10px] font-mono tracking-widest rotate-90 origin-center whitespace-nowrap mt-8 text-foreground/40">
            TIMELINE
          </span>
        </aside>

      </div>
    </div>
  );
}
