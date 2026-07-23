"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Calendar, MapPin, ChevronDown } from "lucide-react";
import { Album, Photo } from "@/lib/types";

interface HeroProps {
  album: Album;
  photos: Photo[];
  onPhotoSelect: (index: number) => void;
  onExploreClick: () => void;
  
  // Customization variables
  orbitCount?: number;
  orbitSizes?: {
    mobile: string;
    tablet: string;
    laptop: string;
    desktop: string;
  };
  minSpeed?: number;
  maxSpeed?: number;
}

export function Hero({
  album,
  photos,
  onPhotoSelect,
  onExploreClick,
  orbitCount = 18,
  orbitSizes = {
    mobile: "w-12",
    tablet: "sm:w-16",
    laptop: "md:w-24",
    desktop: "lg:w-32",
  },
  minSpeed = 0.03,
  maxSpeed = 0.3
}: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);

  // Speed and rotation refs/motion values for circular orbit
  const targetSpeed = useRef<number>(minSpeed);
  const currentSpeed = useRef<number>(minSpeed);
  const isPhotoHovered = useRef<boolean>(false);
  const rotation = useMotionValue<number>(0);
  const negativeRotation = useTransform(rotation, (val) => -val);

  // High performance RAF loop to increment orbit rotation based on dynamic speed
  useEffect(() => {
    let rafId: number;
    const updateRotation = () => {
      if (!isPhotoHovered.current) {
        currentSpeed.current += (targetSpeed.current - currentSpeed.current) * 0.06;
        rotation.set((rotation.get() + currentSpeed.current) % 360);
      }
      rafId = requestAnimationFrame(updateRotation);
    };
    rafId = requestAnimationFrame(updateRotation);
    return () => cancelAnimationFrame(rafId);
  }, [rotation]);

  const formatDate = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return dateStr;
      return dateObj.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to generate a larger pool of photos for the circle (loops if needed)
  const getCirclePhotos = (arr: Photo[], targetCount = 14) => {
    if (!arr || arr.length === 0) return [];
    let result = [...arr];
    while (result.length < targetCount) {
      result = [...result, ...arr];
    }
    return result.slice(0, targetCount);
  };

  const circlePhotos = getCirclePhotos(photos, orbitCount);
  const numCircleItems = circlePhotos.length;
  const angleStep = numCircleItems > 0 ? (2 * Math.PI) / numCircleItems : 0;

  // Track mouse coordinates to scale rotation speed as distance to center decreases
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Diagonal half represents maximum possible distance in container bounds
    const maxDistance = Math.sqrt((rect.width / 2) ** 2 + (rect.height / 2) ** 2);
    const normalizedDistance = Math.min(distance / maxDistance, 1);

    // Target duration increases with distance (closer to center means faster speed)
    const proximity = 1.0 - normalizedDistance; // 1 at center, 0 at bounds
    targetSpeed.current = minSpeed + proximity * (maxSpeed - minSpeed);
  };

  const handleMouseLeave = () => {
    targetSpeed.current = minSpeed;
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden bg-background flex items-center justify-center border-b border-foreground/5 orbit-container"
    >
      {/* Inject hover transition helpers */}
      <style>{`
        .orbit-item-wrapper {
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
      `}</style>

      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--foreground-rgb),0.02)_0%,transparent_70%)] pointer-events-none" />

      {/* Rotating Circular Ring Container */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none [--circle-radius:125px] sm:[--circle-radius:180px] md:[--circle-radius:260px] lg:[--circle-radius:310px]">
        <motion.div
          style={{ rotate: rotation }}
          className="relative w-[800px] h-[800px] flex items-center justify-center pointer-events-none"
        >
          {circlePhotos.map((photo, i) => {
            const angle = i * angleStep;
            const x = Math.cos(angle).toFixed(5);
            const y = Math.sin(angle).toFixed(5);

            return (
              <div
                key={`orbit-${photo.id}-${i}`}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(calc(-50% + ${x} * var(--circle-radius)), calc(-50% + ${y} * var(--circle-radius)))`,
                }}
              >
                <motion.div
                  style={{
                    rotate: negativeRotation,
                    aspectRatio: 1.5
                  }}
                  onMouseEnter={() => {
                    isPhotoHovered.current = true;
                  }}
                  onMouseLeave={() => {
                    isPhotoHovered.current = false;
                  }}
                  className={`relative ${orbitSizes.mobile} ${orbitSizes.tablet} ${orbitSizes.laptop} ${orbitSizes.desktop} rounded-xl sm:rounded-2xl md:rounded-[1.5rem] lg:rounded-3xl overflow-hidden border border-foreground/15 shadow-md hover:shadow-xl hover:border-foreground/35 pointer-events-auto cursor-pointer bg-foreground/5 orbit-item-wrapper`}
                  onClick={() => onPhotoSelect(photos.indexOf(photo))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Image
                    src={photo.thumbnail_url || photo.url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 80px, 150px"
                    priority
                    className="object-cover transition-opacity duration-300"
                  />
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Centered Content Plate */}
      <div className="relative z-20 text-center px-6 py-8 md:px-10 md:py-12 rounded-[2.5rem] bg-background/60 dark:bg-background/85 backdrop-blur-md border border-foreground/10 shadow-2xl max-w-[280px] sm:max-w-xs md:max-w-md lg:max-w-lg flex flex-col items-center justify-center select-none">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-foreground/80 mb-5 bg-background/50 border border-foreground/10 px-3.5 py-1.5 rounded-full shadow-sm">
          <Calendar className="h-3 w-3 text-foreground/60" />
          <span>{formatDate(album.date)}</span>
          <span className="h-1 w-1 rounded-full bg-foreground/30" />
          <MapPin className="h-3 w-3 text-foreground/60" />
          <span>{album.location}</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-foreground leading-tight">
          {album.title}
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-foreground/80 leading-relaxed mb-8 font-sans max-w-sm">
          {album.description}
        </p>

        <div>
          <button
            onClick={onExploreClick}
            className="group flex items-center gap-2.5 text-[10px] font-mono tracking-widest text-foreground/60 hover:text-foreground transition-all cursor-pointer border border-foreground/15 hover:border-foreground/30 bg-background/50 px-4 py-2.5 rounded-full shadow-sm"
          >
            <span>EXPLORE STILLS</span>
            <ChevronDown className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
