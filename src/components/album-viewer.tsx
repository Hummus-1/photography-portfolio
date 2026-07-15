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

export function AlbumViewer({ album, photos }: AlbumViewerProps) {
  const [activePhotoId, setActivePhotoId] = useState<string>("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const photoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const galleryRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer to detect the active image on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -45% 0px", // triggers when image is centered in viewport
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

  return (
    <div className="w-full flex flex-col items-center">
      {/* Refactored Hero Section */}
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

      {/* Main Layout: Asymmetrical grid and Sticky Timeline sidebar */}
      <div className="w-full flex gap-12 lg:gap-24 relative max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-28">
        
        {/* Modular Timeline Tracker (Desktop Sticky / Mobile Bottom Scrubber) */}
        <Timeline photos={photos} activePhotoId={activePhotoId} />

        {/* Gallery Grid (Right side) */}
        <div ref={galleryRef} className="flex-grow space-y-24 md:space-y-36">
          {photos.map((photo, index) => {
            const isWide = index % 3 === 0;
            const isNarrow = index % 3 === 1;

            const widthClass = isWide
              ? "w-full"
              : isNarrow
              ? "w-full lg:w-[90%] mr-auto"
              : "w-full lg:w-[94%] ml-auto";

            return (
              <div
                key={photo.id}
                className={`w-full ${widthClass}`}
              >
                <PhotoCard
                  photo={photo}
                  album={album}
                  index={index}
                  id={`photo-${photo.id}`}
                  innerRef={(el) => {
                    photoRefs.current[`photo-${photo.id}`] = el;
                  }}
                  onSelect={() => {
                    setSelectedPhotoIndex(index);
                    setIsLightboxOpen(true);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Slider Lightbox */}
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
