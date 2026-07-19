"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "@/lib/types";

interface TimelineProps {
  photos: Photo[];
  activePhotoId: string;
}

export function Timeline({ photos, activePhotoId }: TimelineProps) {
  // Find current photo index based on active observer ID
  const activeIndex = photos.findIndex((p) => `photo-${p.id}` === activePhotoId);
  const currentPhotoIndex = activeIndex >= 0 ? activeIndex : 0;

  // Scroll triggers for fading in the vertical desktop timeline
  const { scrollY } = useScroll();
  const timelineOpacity = useTransform(scrollY, [200, 500], [0, 1]);
  const timelineTranslateX = useTransform(scrollY, [200, 500], [-15, 0]);

  // Find percentage height for vertical timeline progress track
  const timelineFillPercentage =
    photos.length > 1
      ? currentPhotoIndex / (photos.length - 1)
      : 0;

  const scrollToPhoto = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementHeight = rect.height;
      const viewportHeight = window.innerHeight;
      
      // Default: Center it vertically in the viewport
      let targetScroll = elementTop - (viewportHeight / 2) + (elementHeight / 2);

      // Boundary safety check: ensure the top of the photo never scrolls closer than 110px to the top of the screen
      const minTopSpacing = 110;
      if (elementTop - targetScroll < minTopSpacing) {
        targetScroll = elementTop - minTopSpacing;
      }

      if (typeof window !== "undefined" && (window as any).lenis) {
        (window as any).lenis.scrollTo(targetScroll, { duration: 1.2 });
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const navigatePhoto = (dir: "next" | "prev") => {
    const nextIdx = dir === "next" ? currentPhotoIndex + 1 : currentPhotoIndex - 1;
    if (nextIdx >= 0 && nextIdx < photos.length) {
      scrollToPhoto(`photo-${photos[nextIdx].id}`);
    }
  };

  return (
    <>
      {/* Sticky Interactive Timeline Sidebar (Desktop only) */}
      <aside className="hidden lg:block w-20 shrink-0 relative z-30">
        <motion.div
          style={{ opacity: timelineOpacity, x: timelineTranslateX }}
          className="sticky top-28 h-[calc(100vh-200px)] flex flex-col items-center justify-center z-30"
        >
          {/* Timeline Vertical Track */}
          <div className="relative h-[65vh] flex flex-col justify-between py-4 items-center">
            
            {/* Background and Foreground tracks */}
            <div className="absolute top-0 bottom-0 left-[11px] w-[2px] bg-foreground/10 rounded-full">
              <motion.div
                className="absolute top-0 left-0 right-0 bg-foreground origin-top rounded-full"
                animate={{ height: `${timelineFillPercentage * 100}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
            </div>

            {/* Dots */}
            {photos.map((photo, index) => {
              const isActive = activePhotoId === `photo-${photo.id}`;
              return (
                <div key={photo.id} className="relative flex items-center group/node z-10">
                  <button
                    onClick={() => scrollToPhoto(`photo-${photo.id}`)}
                    className="w-6 h-6 flex items-center justify-center focus:outline-none cursor-pointer"
                    aria-label={`Jump to photo ${index + 1}`}
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? 1.3 : 1,
                        backgroundColor: isActive ? "var(--foreground)" : "var(--background)",
                        borderColor: isActive ? "var(--foreground)" : "var(--foreground)",
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-3.5 h-3.5 rounded-full border-2 border-foreground"
                    />
                  </button>

                  {/* Timeline Node Hover Card */}
                  <div className="absolute left-8 opacity-0 translate-x-2 pointer-events-none group-hover/node:opacity-100 group-hover/node:translate-x-0 transition-all duration-300 z-30">
                    <div className="flex items-center gap-3 p-2 bg-background/95 border border-foreground/15 rounded-2xl shadow-xl backdrop-blur-md w-48 select-none">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-foreground/5">
                        <Image
                          src={photo.thumbnail_url || photo.url}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-mono text-foreground/45 uppercase tracking-wider">
                          Frame {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-xs font-semibold truncate text-foreground/90">
                          {photo.location || `Frame #${index + 1}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="w-px h-12 bg-foreground/10 mt-6" />
          <span className="text-[9px] font-mono tracking-widest rotate-90 origin-center whitespace-nowrap mt-8 text-foreground/40 font-semibold uppercase">
            Timeline
          </span>
        </motion.div>
      </aside>

      {/* Mobile Floating Progress Bar / Scrubber */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xs h-12 bg-background/85 border border-foreground/10 rounded-full shadow-2xl backdrop-blur-xl z-40 flex items-center justify-between px-3">
        <button
          onClick={() => navigatePhoto("prev")}
          className="p-1.5 rounded-full hover:bg-foreground/5 text-foreground/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          disabled={currentPhotoIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-foreground/75">
          {String(currentPhotoIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
        </span>

        <button
          onClick={() => navigatePhoto("next")}
          className="p-1.5 rounded-full hover:bg-foreground/5 text-foreground/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          disabled={currentPhotoIndex === photos.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
