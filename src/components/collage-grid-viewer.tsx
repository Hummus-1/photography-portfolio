"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import GridLayout, { useContainerWidth, LayoutItem } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { Album, Photo } from "@/lib/types";
import { Camera, Maximize2, MapPin } from "lucide-react";

interface CollageGridViewerProps {
  album: Album;
  photos: Photo[];
  onSelectPhoto: (index: number) => void;
}

/**
 * Calculates initial grid dimensions matching the photo's natural aspect ratio.
 */
function getInitialLayoutItem(photo: Photo, index: number): LayoutItem {
  if (photo.grid_layout && photo.grid_layout.w && photo.grid_layout.h) {
    return {
      i: photo.id,
      x: photo.grid_layout.x ?? 0,
      y: photo.grid_layout.y ?? 0,
      w: photo.grid_layout.w,
      h: photo.grid_layout.h,
    };
  }

  const ar = photo.aspect_ratio || (photo.width && photo.height ? photo.width / photo.height : 1.5);
  let w = 6;
  let h = 4;

  if (ar >= 1.7) {
    w = 12;
    h = Math.max(3, Math.round(12 / ar));
  } else if (ar >= 1.3) {
    w = 6;
    h = Math.max(3, Math.round(6 / ar));
  } else if (ar <= 0.8) {
    w = 4;
    h = Math.max(4, Math.round(4 / ar));
  } else {
    w = 5;
    h = 5;
  }

  return {
    i: photo.id,
    x: (index % 2) * 6,
    y: Math.floor(index / 2) * 4,
    w,
    h,
  };
}

export function CollageGridViewer({ album, photos, onSelectPhoto }: CollageGridViewerProps) {
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const { containerRef, width } = useContainerWidth({ measureBeforeMount: true });

  useEffect(() => {
    if (!photos || photos.length === 0) {
      setLayout([]);
      return;
    }

    const initialLayout: LayoutItem[] = photos.map((photo, index) => getInitialLayoutItem(photo, index));
    setLayout(initialLayout);
  }, [photos]);

  return (
    <div ref={containerRef} className="w-full relative min-h-[500px]">
      {width > 0 ? (
        <GridLayout
          className="layout"
          layout={layout}
          width={width}
          gridConfig={{
            cols: 12,
            rowHeight: 160, // Significantly larger row height for impactful full-width presentation
            margin: [24, 24],
          }}
          dragConfig={{
            enabled: false,
          }}
          resizeConfig={{
            enabled: false,
          }}
        >
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => onSelectPhoto(index)}
              className="group relative overflow-hidden bg-foreground/[0.03] border border-foreground/10 rounded-2xl cursor-pointer transition-all duration-500 hover:border-foreground/40 hover:shadow-2xl flex items-center justify-center p-1"
            >
              <Image
                src={photo.url}
                alt={photo.description || album.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                className="object-contain group-hover:scale-[1.02] transition-transform duration-700 ease-out rounded-2xl"
              />

              {/* Hover Overlay with Lightbox trigger, EXIF, and caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 text-white rounded-2xl">
                <div className="flex justify-end">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white shadow-xl">
                    <Maximize2 className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-3">
                  {photo.description && (
                    <p className="text-sm font-serif italic text-white/95 line-clamp-3 leading-relaxed">
                      "{photo.description}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs font-mono text-white/70 tracking-wider pt-2 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      {photo.exif?.camera && (
                        <span className="flex items-center gap-1.5">
                          <Camera className="h-3.5 w-3.5" />
                          {photo.exif.camera}
                        </span>
                      )}
                      {photo.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {photo.location}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-white/90">Still #{index + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </GridLayout>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-[16/10] bg-foreground/5 rounded-2xl overflow-hidden" />
          ))}
        </div>
      )}
    </div>
  );
}
