"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders,
  Camera,
  MapPin,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Tag
} from "lucide-react";
import { Album, Photo } from "@/lib/types";
import { ColorPalettePill } from "@/components/color-palette-pill";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  photos: Photo[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

export function Lightbox({
  isOpen,
  onClose,
  album,
  photos,
  selectedIndex,
  onIndexChange
}: LightboxProps) {
  const [direction, setDirection] = useState<number>(0);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(false);

  const handlePrev = () => {
    setDirection(-1);
    onIndexChange(selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1);
  };

  const handleNext = () => {
    setDirection(1);
    onIndexChange(selectedIndex === photos.length - 1 ? 0 : selectedIndex + 1);
  };

  // Keyboard shortcut handlers for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex]);

  // Autoplay handler for lightbox
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoplay && isOpen) {
      interval = setInterval(() => {
        handleNext();
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay, isOpen, selectedIndex]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && photos[selectedIndex] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col md:flex-row overflow-hidden"
        >
          {/* Main Content Area: Image Viewer */}
          <div className="flex-1 h-[55vh] md:h-full relative flex items-center justify-center p-4 md:p-12 select-none">
            
            {/* Top Bar inside Lightbox */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
              <div className="text-[10px] font-mono text-foreground/60 bg-background/40 px-3 py-1.5 rounded-full border border-foreground/10 backdrop-blur-md">
                {selectedIndex + 1} / {photos.length}
              </div>

              <div className="flex items-center gap-2">
                {/* Autoplay Slideshow Button */}
                <button
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  className={`p-2.5 rounded-full bg-background/40 hover:bg-background/80 border border-foreground/10 backdrop-blur-md text-foreground transition-all cursor-pointer ${
                    isAutoplay ? "border-foreground" : ""
                  }`}
                  title={isAutoplay ? "Pause Slideshow" : "Play Slideshow"}
                >
                  {isAutoplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full bg-background/40 hover:bg-background/80 border border-foreground/10 backdrop-blur-md text-foreground transition-all hover:rotate-90 duration-300 cursor-pointer"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-6 p-3 rounded-full bg-background/40 hover:bg-background/80 border border-foreground/10 backdrop-blur-md text-foreground transition-all z-10 hover:-translate-x-1 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-6 p-3 rounded-full bg-background/40 hover:bg-background/80 border border-foreground/10 backdrop-blur-md text-foreground transition-all z-10 hover:translate-x-1 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Image Container with Slider Transition */}
            <div className="w-full h-full max-w-[98%] max-h-[92vh] md:max-h-[96vh] relative flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={selectedIndex}
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({
                      x: dir > 0 ? 150 : -150,
                      opacity: 0,
                      scale: 0.95
                    }),
                    center: {
                      x: 0,
                      opacity: 1,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }
                    },
                    exit: (dir: number) => ({
                      x: dir < 0 ? 150 : -150,
                      opacity: 0,
                      scale: 0.95,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }
                    })
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute w-full h-full flex items-center justify-center"
                >
                  {/* The Lightbox Image: rounded-3xl as requested! */}
                  {/* The Lightbox Image Container: wraps image exactly with minimal padding */}
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-foreground/10 bg-foreground/5 max-w-[92%] max-h-[92vh] md:max-h-[96vh] flex items-center justify-center">
                    <Image
                      src={photos[selectedIndex].url}
                      alt={photos[selectedIndex].location || album.title}
                      width={photos[selectedIndex].width}
                      height={photos[selectedIndex].height}
                      className="w-auto h-auto max-w-full max-h-[80vh] md:max-h-[84vh] block rounded-3xl"
                      // sizes="(max-width: 1200px) 100vw, 1200px"
                      priority
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Autoplay Progress Line */}
            {isAutoplay && (
              <div className="absolute bottom-6 left-12 right-12 h-1 bg-foreground/10 rounded-full overflow-hidden">
                <motion.div
                  key={selectedIndex}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, ease: "linear" }}
                  className="h-full bg-foreground"
                />
              </div>
            )}
          </div>

          {/* Sidebar Info Drawer */}
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-full md:w-[350px] lg:w-[400px] h-[45vh] md:h-full bg-background border-t md:border-t-0 md:border-l border-foreground/10 p-6 md:p-8 overflow-y-auto shrink-0 flex flex-col justify-between"
          >
            <div className="space-y-8">
              {/* Header */}
              <div>
                <span className="text-[9px] font-mono tracking-widest uppercase text-foreground/40 block mb-2">
                  {album.title}
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {photos[selectedIndex].location || `Frame #${selectedIndex + 1}`}
                </h2>
                <div className="flex items-center gap-2 text-xs font-mono text-foreground/50 mt-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(album.date)}</span>
                </div>
                {photos[selectedIndex].description && (
                  <p className="text-sm text-foreground/80 mt-3 font-sans leading-relaxed">
                    {photos[selectedIndex].description}
                  </p>
                )}
                {photos[selectedIndex].score !== undefined && photos[selectedIndex].score !== null && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 font-mono text-xs font-bold mt-3">
                    ★ Score: {photos[selectedIndex].score} / 10
                  </div>
                )}
              </div>

              {/* EXIF Metadata card */}
              <div className="bg-foreground/[0.02] border border-foreground/10 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-foreground/60 flex items-center gap-2 border-b border-foreground/10 pb-2">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>EXIF DATA</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {photos[selectedIndex].exif.camera && (
                    <div className="col-span-2 space-y-1">
                      <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-wider block">Camera</span>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Camera className="h-3.5 w-3.5 text-foreground/60" />
                        <span>{photos[selectedIndex].exif.camera}</span>
                      </div>
                    </div>
                  )}

                  {photos[selectedIndex].exif.lens && (
                    <div className="col-span-2 space-y-1">
                      <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-wider block">Lens</span>
                      <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
                        <span className="truncate">{photos[selectedIndex].exif.lens}</span>
                      </div>
                    </div>
                  )}

                  {photos[selectedIndex].exif.focal_length && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-wider block">Focal Length</span>
                      <span className="text-xs font-mono font-medium text-foreground">{photos[selectedIndex].exif.focal_length}</span>
                    </div>
                  )}

                  {photos[selectedIndex].exif.aperture && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-wider block">Aperture</span>
                      <span className="text-xs font-mono font-medium text-foreground">{photos[selectedIndex].exif.aperture}</span>
                    </div>
                  )}

                  {photos[selectedIndex].exif.shutter && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-wider block">Shutter</span>
                      <span className="text-xs font-mono font-medium text-foreground">{photos[selectedIndex].exif.shutter}</span>
                    </div>
                  )}

                  {photos[selectedIndex].exif.iso && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-wider block">ISO</span>
                      <span className="text-xs font-mono font-medium text-foreground">ISO {photos[selectedIndex].exif.iso}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Color Palette */}
              {photos[selectedIndex].color_palette && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-foreground/60 flex items-center gap-2">
                    <span>SPECTRUM</span>
                  </h3>
                  <ColorPalettePill colors={photos[selectedIndex].color_palette} />
                </div>
              )}

              {/* Tags */}
              {photos[selectedIndex].tags && photos[selectedIndex].tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-foreground/60 flex items-center gap-2">
                    <Tag className="h-3 w-3" />
                    <span>TAGS</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {photos[selectedIndex].tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono uppercase bg-foreground/5 hover:bg-foreground/10 text-foreground/70 px-2 py-1 rounded transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Close Sidebar helper for mobile */}
            <div className="mt-8 pt-4 border-t border-foreground/10 flex items-center justify-between">
              <span className="text-[9px] font-mono text-foreground/35">
                STILLS PORTFOLIO
              </span>
              <button
                onClick={onClose}
                className="text-xs font-mono text-foreground/60 hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
              >
                Close Viewer <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
