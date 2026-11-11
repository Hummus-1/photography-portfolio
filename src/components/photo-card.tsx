"use client";

import { useRef, useMemo, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Sliders, Camera, MapPin, Maximize2 } from "lucide-react";
import { Album, Photo } from "@/lib/types";
import { ProgressiveImage } from "@/components/ui/progressive-image";

function subscribeMediaQuery(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(min-width: 768px)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMediaQuerySnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 768px)").matches;
}

function getMediaQueryServerSnapshot() {
  return false;
}

interface PhotoCardProps {
  photo: Photo;
  album: Album;
  index: number;
  id?: string;
  innerRef?: React.Ref<HTMLDivElement>;
  onSelect: () => void;
  fillWidth?: boolean;
  isInRow?: boolean;
  colIndex?: number;
  colCount?: number;
}

export function PhotoCard({
  photo,
  album,
  index,
  id,
  innerRef,
  onSelect,
  fillWidth,
  isInRow = false,
  colIndex = 0,
  colCount = 1,
}: PhotoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isDesktop = useSyncExternalStore(
    subscribeMediaQuery,
    getMediaQuerySnapshot,
    getMediaQueryServerSnapshot
  );
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Calculate parallax offsets based on column position in the row or single status
  const yOffset = useMemo(() => {
    if (shouldReduceMotion) return [0, 0];

    if (isInRow) {
      if (isDesktop) {
        if (colCount === 2) {
          // Opposite drift in 2-column rows: left rises faster, right lags smoothly
          return colIndex === 0 ? [36, -36] : [-36, 36];
        } else if (colCount === 3) {
          // Staggered depth across 3 columns
          if (colIndex === 0) return [45, -45];
          if (colIndex === 1) return [-30, 30];
          return [35, -35];
        } else {
          // 4+ columns alternating
          return colIndex % 2 === 0 ? [35, -35] : [-35, 35];
        }
      } else {
        // Stacked vertically on mobile: subtle tandem drift without overlap
        return colIndex % 2 === 0 ? [14, -14] : [8, -8];
      }
    }

    // Standalone single photo cards: subtle gentle glide
    const magnitude = isDesktop ? 24 : 12;
    return index % 2 === 0 ? [magnitude, -magnitude] : [-magnitude * 0.75, magnitude * 0.75];
  }, [shouldReduceMotion, isInRow, isDesktop, colCount, colIndex, index]);

  const parallaxY = useTransform(scrollYProgress, [0, 1], yOffset);

  return (
    <div ref={cardRef} className="w-full flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        onClick={onSelect}
        className="group cursor-pointer select-none mx-auto w-full"
        style={{
          width: fillWidth ? "100%" : `min(100%, calc((100vh - 90px) * ${photo.aspect_ratio || 1.5}))`,
        }}
      >
        <motion.div
          style={{ y: parallaxY }}
          className="relative flex flex-col w-full will-change-transform"
        >
          {/* Photo Element */}
          <div
            ref={innerRef}
            id={id}
            className="relative overflow-hidden rounded-3xl w-full border border-foreground/10 shadow-lg hover:shadow-2xl transition-all duration-500 select-none"
          >
            <ProgressiveImage
              src={photo.url}
              thumbnailSrc={photo.thumbnail_url}
              dominantColor={photo.color_palette?.[0]}
              alt={photo.location || album.title}
              aspectRatio={photo.aspect_ratio || (photo.width && photo.height ? photo.width / photo.height : 1.5)}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority={index < 2}
              variant="breathing"
              hoverEffect="subtle"
              containerClassName="rounded-3xl"
              className="rounded-3xl"
            >
              {/* Elegant Dark/Light Glassmorphism overlay showing EXIF + Colors on Hover */}
              <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 md:p-8 pointer-events-none">
                
                {/* Location Tag */}
                {photo.location && (
                  <div className="text-[10px] font-mono tracking-widest uppercase text-foreground/60 mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-foreground/60" />
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
                          <span className="text-foreground/60 font-normal hidden lg:inline">
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

                  {/* View Full Frame CTA */}
                  <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-foreground/60 hover:text-foreground transition-colors">
                    <span>VIEW FRAME</span>
                    <Maximize2 className="h-3.5 w-3.5" />
                  </div>

                </div>
              </div>
            </ProgressiveImage>
          </div>

          {/* Photo labels shown underneath the photo */}
          <div className="mt-4 flex items-center justify-between px-2 text-[10px] font-mono uppercase tracking-widest text-foreground/50">
            <div className="flex flex-wrap gap-2.5">
              {photo.tags && photo.tags.slice(0, 3).map((tag, tIdx) => (
                <span key={tIdx} className="hover:text-foreground transition-colors duration-300">
                  #{tag}
                </span>
              ))}
            </div>
            {photo.location && (
              <span className="text-foreground/45 lowercase tracking-wider">{photo.location}</span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
