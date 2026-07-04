"use client";

import React from "react";
import Image from "next/image";
import { Camera, Image as ImageIcon, Loader2, Tag, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Photo } from "@/lib/types";

interface PhotoGridProps {
  photos: Photo[];
  photosLoading: boolean;
  onDeletePhoto: (photoId: string) => void;
}

export function PhotoGrid({ photos, photosLoading, onDeletePhoto }: PhotoGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h4 className="font-serif text-lg font-bold tracking-wide flex items-center gap-2">
          <ImageIcon className="h-5 w-5 opacity-70" />
          <span>Album Photos ({photos.length})</span>
        </h4>
      </div>

      {photosLoading ? (
        <div className="flex py-20 justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        </div>
      ) : photos.length === 0 ? (
        <p className="text-sm text-white/40 italic py-10 text-center">
          No photos uploaded to this album yet. Drag and drop to begin!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className="bg-[#14171a] border-white/10 rounded-none text-white overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-[3/2] w-full bg-black/20">
                <Image
                  src={photo.thumbnail_url || photo.url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-cover"
                />
                <button
                  onClick={() => onDeletePhoto(photo.id)}
                  className="absolute top-3 right-3 bg-black/75 hover:bg-red-500/80 p-2 rounded-none transition-colors border border-white/10"
                  title="Delete Photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <CardContent className="p-4 space-y-4">
                {/* EXIF parameters summary */}
                {photo.exif && photo.exif.camera && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                      <Camera className="h-3.5 w-3.5 opacity-70" />
                      <span className="truncate">{photo.exif.camera}</span>
                    </div>
                    <div className="text-[10px] font-mono text-white/40">
                      {[
                        photo.exif.focal_length,
                        photo.exif.aperture,
                        photo.exif.shutter,
                        photo.exif.iso ? `ISO ${photo.exif.iso}` : null,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </div>
                  </div>
                )}

                {/* Color Palette bar */}
                {photo.color_palette && photo.color_palette.length > 0 && (
                  <div className="flex gap-1.5">
                    {photo.color_palette.map((color, idx) => (
                      <div
                        key={idx}
                        className="h-3 flex-grow border border-white/5"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}

                {/* Tags Display */}
                {photo.tags && photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {photo.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[8px] font-mono uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 text-white/60 tracking-wider flex items-center gap-1"
                      >
                        <Tag className="h-2 w-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
