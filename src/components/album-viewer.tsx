"use client";

import { useEffect, useRef, useState } from "react";
import { Album, Photo } from "@/lib/types";
import Link from "next/link";
import { FolderOpen, ArrowLeft } from "lucide-react";
import { selectBestAccentColor } from "@/lib/color-utils";

// Import modular subcomponents
import { Hero } from "@/components/hero";
import { PhotoCard } from "@/components/photo-card";
import { Lightbox } from "@/components/lightbox";
import { Timeline } from "@/components/timeline";

interface AlbumViewerProps {
  album: Album;
  photos: Photo[];
}

interface ChunkItem {
  type: "single" | "group";
  groupId?: string;
  items: { photo: Photo; globalIndex: number }[];
}

function getPhotoChunks(photos: Photo[]): ChunkItem[] {
  const chunks: ChunkItem[] = [];
  let i = 0;
  while (i < photos.length) {
    const current = photos[i];
    if (current.group_id) {
      const gId = current.group_id;
      const groupItems = [{ photo: current, globalIndex: i }];
      let j = i + 1;
      while (j < photos.length && photos[j].group_id === gId) {
        groupItems.push({ photo: photos[j], globalIndex: j });
        j++;
      }
      if (groupItems.length > 1) {
        chunks.push({ type: "group", groupId: gId, items: groupItems });
        i = j;
        continue;
      }
    }
    chunks.push({
      type: "single",
      items: [{ photo: current, globalIndex: i }],
    });
    i++;
  }
  return chunks;
}

export function AlbumViewer({ album, photos }: AlbumViewerProps) {
  const [activePhotoId, setActivePhotoId] = useState<string>("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const photoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const galleryRef = useRef<HTMLDivElement>(null);

  // Intersection observer & scroll position fallback to track active photo on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-15% 0px -35% 0px",
      threshold: [0.1, 0.4, 0.8],
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the entry with the highest intersection ratio
      const visibleEntries = entries.filter((e) => e.isIntersecting);
      if (visibleEntries.length > 0) {
        visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        setActivePhotoId(visibleEntries[0].target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    Object.values(photoRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [photos]);

  const coverPhoto = photos.find((p) => p.url === album.cover_image_url) || photos[0];
  const albumPalette = (album.cover_color_palette && album.cover_color_palette.length > 0)
    ? album.cover_color_palette
    : (coverPhoto?.color_palette && coverPhoto.color_palette.length > 0)
    ? coverPhoto.color_palette
    : null;
  const accentColor = selectBestAccentColor(albumPalette, "#d96b27", album.custom_hero_color);
  const chunks = getPhotoChunks(photos);

  return (
    <div className="w-full flex flex-col items-center relative">

      {/* Hero Section */}
      <Hero
        album={album}
        photos={photos}
        onPhotoSelect={(index) => {
          setSelectedPhotoIndex(index);
          setIsLightboxOpen(true);
        }}
        onExploreClick={() => {
          const target = galleryRef.current;
          if (target) {
            const firstPhotoEl = target.querySelector("[id^='photo-']");
            const elementToScroll = firstPhotoEl || target;
            const rect = elementToScroll.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            const elementHeight = rect.height;
            const viewportHeight = window.innerHeight;

            const targetScroll = Math.max(0, elementTop - (viewportHeight / 2) + (elementHeight / 2));

            if (typeof window !== "undefined" && (window as any).lenis) {
              (window as any).lenis.scrollTo(targetScroll, { duration: 1.0 });
            } else {
              window.scrollTo({ top: targetScroll, behavior: "smooth" });
            }
          }
        }}
      />

      {/* Main Gallery Section or Empty Photos Notice */}
      {photos.length === 0 ? (
        <div className="w-full max-w-xl mx-auto my-16 p-10 bg-white/5 border border-dashed border-white/20 text-center flex flex-col items-center justify-center">
          <FolderOpen className="h-10 w-10 text-white/30 mb-3" />
          <p className="font-serif font-bold text-sm tracking-widest uppercase text-white/80">
            No Stills Available
          </p>
          <p className="text-xs text-white/50 pt-1">
            This photo collection currently has no published stills.
          </p>
        </div>
      ) : (
        <div className="w-full flex gap-12 lg:gap-24 relative max-w-340 mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-20">
          {/* Timeline Tracker */}
          <Timeline photos={photos} activePhotoId={activePhotoId} accentColor={accentColor} />

          {/* Gallery Content Area */}
          <div ref={galleryRef} className="flex-grow space-y-24 md:space-y-36">
            {chunks.map((chunk, chunkIdx) => {
              if (chunk.type === "group") {
                const colCount = Math.min(chunk.items.length, 4);
                const gridColsClass =
                  colCount === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : colCount === 3
                    ? "grid-cols-1 md:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

                return (
                  <div
                    key={`chunk-${chunk.groupId}-${chunkIdx}`}
                    className={`w-full grid ${gridColsClass} gap-6 md:gap-8 items-start`}
                  >
                    {chunk.items.map(({ photo, globalIndex }) => (
                      <div key={photo.id} className="w-full">
                        <PhotoCard
                          photo={photo}
                          album={album}
                          index={globalIndex}
                          id={`photo-${photo.id}`}
                          innerRef={(el) => {
                            photoRefs.current[`photo-${photo.id}`] = el;
                          }}
                          onSelect={() => {
                            setSelectedPhotoIndex(globalIndex);
                            setIsLightboxOpen(true);
                          }}
                          fillWidth={true}
                        />
                      </div>
                    ))}
                  </div>
                );
              }

              // Standalone single photo
              const { photo, globalIndex } = chunk.items[0];
              const isWide = globalIndex % 3 === 0;
              const isNarrow = globalIndex % 3 === 1;

              const widthClass = isWide
                ? "w-full"
                : isNarrow
                ? "w-full lg:w-[90%] mr-auto"
                : "w-full lg:w-[94%] ml-auto";

              return (
                <div key={photo.id} className={`w-full ${widthClass}`}>
                  <PhotoCard
                    photo={photo}
                    album={album}
                    index={globalIndex}
                    id={`photo-${photo.id}`}
                    innerRef={(el) => {
                      photoRefs.current[`photo-${photo.id}`] = el;
                    }}
                    onSelect={() => {
                      setSelectedPhotoIndex(globalIndex);
                      setIsLightboxOpen(true);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        album={album}
        photos={photos}
        selectedIndex={selectedPhotoIndex}
        onIndexChange={setSelectedPhotoIndex}
      />
    </div>
  );
}
