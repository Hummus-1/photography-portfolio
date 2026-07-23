"use client";

import { useEffect, useRef, useState } from "react";
import { Album, Photo } from "@/lib/types";

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

  // Intersection observer to track active photo on scroll for Timeline sidebar
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -45% 0px",
      threshold: 0.1,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActivePhotoId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    Object.values(photoRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [photos]);

  const chunks = getPhotoChunks(photos);

  return (
    <div className="w-full flex flex-col items-center">
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
            if (typeof window !== "undefined" && (window as any).lenis) {
              (window as any).lenis.scrollTo(target, { align: "start", duration: 1.2 });
            } else {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        }}
      />

      {/* Main Gallery Section with Sticky Timeline */}
      <div className="w-full flex gap-12 lg:gap-24 relative max-w-340 mx-auto px-6 md:px-12 py-12 md:py-20">
        {/* Timeline Tracker */}
        <Timeline photos={photos} activePhotoId={activePhotoId} />

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
