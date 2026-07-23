"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sliders, Camera, MapPin, Maximize2 } from "lucide-react";
import { Album, Photo } from "@/lib/types";

interface PhotoCardProps {
  photo: Photo;
  album: Album;
  index: number;
  id?: string;
  innerRef?: React.Ref<HTMLDivElement>;
  onSelect: () => void;
  fillWidth?: boolean;
}

export function PhotoCard({ photo, album, index, id, innerRef, onSelect, fillWidth }: PhotoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 60, damping: 20 }}
      onClick={onSelect}
      className="group cursor-pointer select-none mx-auto w-full"
      style={{
        width: fillWidth ? "100%" : `min(100%, calc((100vh - 90px) * ${photo.aspect_ratio || 1.5}))`,
      }}
    >
      <div className="relative flex flex-col w-full">
        {/* Photo Element */}
        <div
          ref={innerRef}
          id={id}
          className="relative overflow-hidden rounded-3xl bg-foreground/5 w-full border border-foreground/10 shadow-lg hover:shadow-2xl transition-all duration-500"
        >
          <Image
            src={photo.url}
            alt={photo.location || album.title}
            width={photo.width}
            height={photo.height}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority={index < 2}
            className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-[1.01] pointer-events-none rounded-3xl"
          />

          {/* Elegant Dark/Light Glassmorphism overlay showing EXIF + Colors on Hover */}
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 md:p-8">
            
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
      </div>
    </motion.div>
  );
}
