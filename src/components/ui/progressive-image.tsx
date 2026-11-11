"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export interface ProgressiveImageProps {
  // Source media
  src: string;
  thumbnailSrc?: string;
  blurDataURL?: string;
  dominantColor?: string;
  alt: string;

  // Loading animation mode
  variant?: "breathing" | "fade" | "minimal";
  transitionDuration?: number; // default 700ms

  // Layout & Dimensions
  fill?: boolean;
  width?: number;
  height?: number;
  aspectRatio?: number | string; // e.g. 1.5, 0.8, "16/10", "4/5"
  sizes?: string;
  priority?: boolean;
  quality?: number;

  // Visual Styling & Framing
  objectFit?: "cover" | "contain";
  hoverEffect?: "subtle" | "editorial" | "none";
  frame?: "archival" | "none";
  ringColor?: string; // hex, rgb, or css color string
  glow?: boolean; // glowing ambient halo on hover
  gradient?: "bottom" | "both" | "none";

  // Additional styling
  className?: string;
  containerClassName?: string;
  style?: React.CSSProperties;
  protectedImage?: boolean;

  // Slots & Events
  children?: React.ReactNode;
  onLoad?: () => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;

  // Optional tool for lab simulation (ignored in normal production use)
  simulatedDelayMs?: number;
}

export function ProgressiveImage({
  src,
  thumbnailSrc,
  blurDataURL,
  dominantColor,
  alt,
  variant = "breathing",
  transitionDuration = 700,
  fill = false,
  width,
  height,
  aspectRatio,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1200px",
  priority = false,
  quality = 85,
  objectFit = "cover",
  hoverEffect = "subtle",
  frame = "none",
  ringColor,
  glow = false,
  gradient = "none",
  className = "",
  containerClassName = "",
  style,
  protectedImage = true,
  children,
  onLoad,
  onClick,
  simulatedDelayMs,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Preferred preview source: thumbnailSrc > blurDataURL
  const previewSrc = thumbnailSrc || blurDataURL;

  // Handle simulated latency if specified (for lab/testing)
  useEffect(() => {
    if (typeof simulatedDelayMs === "number" && simulatedDelayMs > 0) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
        if (onLoad) onLoad();
      }, simulatedDelayMs);
      return () => clearTimeout(timer);
    }
  }, [simulatedDelayMs, onLoad]);

  const handleImageLoad = () => {
    if (!simulatedDelayMs) {
      setIsLoaded(true);
      if (onLoad) onLoad();
    }
  };

  // Exact hover zoom classes from Curated Collections (HomeCollections.tsx & Hero.tsx)
  const hoverClasses = {
    editorial:
      "scale-100 group-hover/img:scale-[1.02] group-hover:scale-[1.02] group-hover/img:saturate-[1.12] group-hover:saturate-[1.12] group-hover/img:contrast-[1.05] group-hover:contrast-[1.05] transition-all duration-700 ease-out",
    subtle:
      "scale-100 group-hover/img:scale-[1.01] group-hover:scale-[1.01] transition-all duration-700 ease-out",
    none: "scale-100 transition-opacity duration-700 ease-out",
  }[hoverEffect];

  // Dynamic frame styles when ringColor / glow are provided
  const frameStyle: React.CSSProperties = {};
  if (frame === "archival" && ringColor) {
    if (isHovered) {
      frameStyle.borderColor = `${ringColor}99`; // ~60% opacity border
      if (glow) {
        frameStyle.boxShadow = `0 0 45px -5px ${ringColor}55`;
      }
    }
  }

  // Format aspect ratio style
  const aspectStyle: React.CSSProperties = {};
  if (aspectRatio) {
    aspectStyle.aspectRatio = typeof aspectRatio === "number" ? `${aspectRatio}` : aspectRatio;
  }

  // Core image container element
  const imageCore = (
    <div
      data-protected-image={protectedImage ? "" : undefined}
      style={{
        ...aspectStyle,
        backgroundColor: dominantColor ? `${dominantColor}18` : undefined,
      }}
      className={`relative w-full overflow-hidden select-none ${
        fill ? "h-full" : ""
      } ${
        frame === "archival" ? "rounded-xl sm:rounded-2xl" : "rounded-2xl sm:rounded-3xl"
      } ${containerClassName}`}
    >
      {/* 1. AMBIENT DOMINANT COLOR GLOW (IF PROVIDED) */}
      {dominantColor && !isLoaded && (
        <div
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-700"
          style={{
            backgroundColor: `${dominantColor}25`,
            background: `radial-gradient(circle at 50% 50%, ${dominantColor}45 0%, transparent 80%)`,
          }}
        />
      )}

      {/* 2. PROGRESSIVE BLURRED PREVIEW WITH 3B ORGANIC BREATHING PULSE */}
      {previewSrc && (
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: transitionDuration / 1000, ease: "easeOut" }}
              className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
            >
              {variant === "breathing" ? (
                /* 3B: Organic luma & scale pulse while loading */
                <motion.img
                  src={previewSrc}
                  alt=""
                  aria-hidden="true"
                  animate={{
                    opacity: [0.75, 1, 0.75],
                    scale: [1.08, 1.13, 1.08],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "easeInOut",
                  }}
                  className={`w-full h-full filter blur-xl ${
                    objectFit === "contain" ? "object-contain" : "object-cover"
                  }`}
                />
              ) : (
                /* Simple static blur crossfade (variant === "fade") */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewSrc}
                  alt=""
                  aria-hidden="true"
                  className={`w-full h-full filter blur-xl scale-110 ${
                    objectFit === "contain" ? "object-contain" : "object-cover"
                  }`}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* 3. FULL RESOLUTION HIGH-FIDELITY IMAGE MATCHING CURATED COLLECTIONS */}
      {fill || aspectRatio ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          draggable={false}
          onLoad={handleImageLoad}
          className={`pointer-events-none select-none ${
            objectFit === "contain" ? "object-contain" : "object-cover"
          } ${hoverClasses} ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 1200}
          height={height || 800}
          sizes={sizes}
          priority={priority}
          quality={quality}
          draggable={false}
          onLoad={handleImageLoad}
          className={`w-full h-auto block pointer-events-none select-none ${
            objectFit === "contain" ? "object-contain" : "object-cover"
          } ${hoverClasses} ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      )}

      {/* 4. OPTIONAL TEXT READABILITY GRADIENT SCRIMS */}
      {gradient === "bottom" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none z-20" />
      )}
      {gradient === "both" && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none z-20" />
      )}

      {/* 5. CHILDREN SLOTS (Viewfinder Reticles, EXIF Pills, Captions) */}
      {children && <div className="absolute inset-0 z-30 pointer-events-none">{children}</div>}
    </div>
  );

  // If archival framing is requested, wrap in the museum double-border mount
  // Notice: group/img is placed on this outermost wrapper so hovering over the frame padding triggers smooth zoom with zero jitter
  if (frame === "archival") {
    return (
      <div
        style={{ ...frameStyle, ...style }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className={`group/img w-full ${fill ? "h-full" : ""} p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border border-foreground/15 bg-background/80 shadow-xl backdrop-blur-md transition-all duration-500 ${
          onClick ? "cursor-pointer" : ""
        }`}
      >
        {imageCore}
      </div>
    );
  }

  // Borderless / default layout
  return (
    <div
      style={style}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group/img w-full ${fill ? "h-full" : ""} ${onClick ? "cursor-pointer" : ""}`}
    >
      {imageCore}
    </div>
  );
}
