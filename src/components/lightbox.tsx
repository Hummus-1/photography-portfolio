"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Sliders,
  Camera,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Tag,
  Info,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { Album, Photo } from "@/lib/types";
import { ColorPalettePill } from "@/components/color-palette-pill";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  album?: Album | null;
  photos: Photo[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  showScore?: boolean;
}

export function Lightbox({
  isOpen,
  onClose,
  album,
  photos,
  selectedIndex,
  onIndexChange,
  showScore = false,
}: LightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [direction, setDirection] = useState<number>(0);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(false);
  const [showMobileInfo, setShowMobileInfo] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handlePrev = () => {
    setDirection(-1);
    onIndexChange(selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1);
  };

  const handleNext = () => {
    setDirection(1);
    onIndexChange(selectedIndex === photos.length - 1 ? 0 : selectedIndex + 1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
      if (e.key === "i" || e.key === "I") setShowMobileInfo((prev) => !prev);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex]);

  // Autoplay slideshow handler
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoplay && isOpen) {
      interval = setInterval(() => {
        handleNext();
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay, isOpen, selectedIndex]);

  // Swipe gesture handler for mobile touch devices
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Date pending";
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

  if (!mounted) return null;

  const currentPhoto = photos[selectedIndex];

  const content = (
    <AnimatePresence>
      {isOpen && currentPhoto && (
        <motion.div
          key="lightbox-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex flex-col md:flex-row overflow-hidden h-[100dvh] w-full select-none"
        >
          {/* Main Photo Viewer Area */}
          <div className="flex-1 relative flex items-center justify-center p-3 sm:p-6 md:p-12 h-full overflow-hidden">
            
            {/* Top Header Floating Controls Bar */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-30 pointer-events-none">
              
              {/* Step / Frame Counter */}
              <div className="pointer-events-auto text-[11px] font-mono text-foreground/80 bg-background/60 px-3.5 py-1.5 rounded-full border border-foreground/15 backdrop-blur-md shadow-sm">
                <span className="font-bold text-primary">{selectedIndex + 1}</span> / {photos.length}
              </div>

              {/* Top Action Buttons Group */}
              <div className="pointer-events-auto flex items-center gap-2">
                
                {/* Mobile Info Toggle Button (Mobile viewports) */}
                <button
                  onClick={() => setShowMobileInfo(!showMobileInfo)}
                  className={`md:hidden p-2.5 rounded-full bg-background/60 hover:bg-background/90 border border-foreground/15 backdrop-blur-md text-foreground transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    showMobileInfo ? "bg-primary text-white border-primary shadow-md" : ""
                  }`}
                  title="Toggle EXIF & Info"
                  aria-label="Toggle photo metadata"
                >
                  <Info className="h-4 w-4" />
                </button>

                {/* Autoplay Slideshow Button */}
                <button
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  className={`p-2.5 rounded-full bg-background/60 hover:bg-background/90 border border-foreground/15 backdrop-blur-md text-foreground transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    isAutoplay ? "border-primary text-primary bg-primary/10" : ""
                  }`}
                  title={isAutoplay ? "Pause Slideshow" : "Play Slideshow"}
                  aria-label={isAutoplay ? "Pause Slideshow" : "Play Slideshow"}
                >
                  {isAutoplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-foreground/80" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full bg-background/60 hover:bg-background/90 border border-foreground/15 backdrop-blur-md text-foreground transition-all hover:rotate-90 duration-300 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Close Lightbox (Esc)"
                  aria-label="Close Lightbox"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Left Arrow Navigation Button */}
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 rounded-full bg-background/50 hover:bg-background/90 border border-foreground/15 backdrop-blur-md text-foreground transition-all z-20 hover:-translate-x-1 active:scale-95 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shadow-lg"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Right Arrow Navigation Button */}
            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 rounded-full bg-background/50 hover:bg-background/90 border border-foreground/15 backdrop-blur-md text-foreground transition-all z-20 hover:translate-x-1 active:scale-95 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shadow-lg"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Main Photo Canvas Container with Touch Drag Swipe */}
            <div className="w-full h-full max-w-full max-h-[85dvh] md:max-h-[94dvh] relative flex items-center justify-center touch-pan-y">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={selectedIndex}
                  custom={direction}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  variants={{
                    enter: (dir: number) => ({
                      x: dir > 0 ? 120 : -120,
                      opacity: 0,
                      scale: 0.96,
                    }),
                    center: {
                      x: 0,
                      opacity: 1,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      },
                    },
                    exit: (dir: number) => ({
                      x: dir < 0 ? 120 : -120,
                      opacity: 0,
                      scale: 0.96,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      },
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute w-full h-full flex items-center justify-center p-2 sm:p-4 cursor-grab active:cursor-grabbing"
                >
                  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-foreground/15 bg-black/40 max-w-full max-h-full flex items-center justify-center">
                    <Image
                      src={currentPhoto.url}
                      alt={currentPhoto.location || album?.title || "Photo"}
                      width={currentPhoto.width || 2000}
                      height={currentPhoto.height || 1500}
                      className="w-auto h-auto max-w-full max-h-[78dvh] md:max-h-[88dvh] object-contain rounded-2xl sm:rounded-3xl"
                      priority
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Autoplay Progress Bar */}
            {isAutoplay && (
              <div className="absolute bottom-3 sm:bottom-6 left-6 right-6 sm:left-12 sm:right-12 h-1 bg-foreground/10 rounded-full overflow-hidden z-20">
                <motion.div
                  key={selectedIndex}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, ease: "linear" }}
                  className="h-full bg-primary"
                />
              </div>
            )}

            {/* Bottom Floating Quick Info Pill for Mobile */}
            <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={() => setShowMobileInfo(!showMobileInfo)}
                className="px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-foreground/20 text-foreground text-xs font-mono flex items-center gap-2 shadow-lg hover:border-primary transition-colors min-h-[40px] cursor-pointer"
              >
                <span>{currentPhoto.location || album?.title || "Photo"}</span>
                <ChevronUp className={`h-3.5 w-3.5 text-primary transition-transform ${showMobileInfo ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {/* Info & EXIF Drawer Sidebar (Desktop fixed right panel, Mobile slide-up sheet) */}
          <div
            className={`w-full md:w-[350px] lg:w-[400px] bg-background border-t md:border-t-0 md:border-l border-foreground/15 shrink-0 flex flex-col justify-between transition-all duration-300 z-30 ${
              showMobileInfo
                ? "fixed inset-x-0 bottom-0 max-h-[75dvh] rounded-t-3xl shadow-2xl p-6 overflow-y-auto block md:relative md:inset-auto md:max-h-none md:p-8 md:h-full"
                : "hidden md:flex md:h-full md:p-8 md:overflow-y-auto"
            }`}
          >
            <div className="space-y-6 sm:space-y-8">
              
              {/* Header Title & Date */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-primary font-semibold block mb-1">
                    {album?.title || "Collection"}
                  </span>

                  {/* Close drawer button on mobile */}
                  <button
                    onClick={() => setShowMobileInfo(false)}
                    className="md:hidden p-1 text-foreground/60 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {currentPhoto.location || `Frame #${selectedIndex + 1}`}
                </h2>

                <div className="flex items-center gap-2 text-xs font-mono text-foreground/60 mt-2">
                  <Calendar className="h-3.5 w-3.5 text-foreground/40" />
                  <span>{formatDate(album?.date)}</span>
                </div>

                {currentPhoto.description && (
                  <p className="text-xs sm:text-sm text-foreground/80 mt-3 font-sans leading-relaxed">
                    {currentPhoto.description}
                  </p>
                )}

                {showScore && currentPhoto.score !== undefined && currentPhoto.score !== null && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/30 rounded-lg text-primary font-mono text-xs font-bold mt-3">
                    ★ Score: {currentPhoto.score} / 10
                  </div>
                )}
              </div>

              {/* EXIF Metadata Card */}
              {(() => {
                const currentExif = currentPhoto?.exif || {};
                const hasExif = Boolean(
                  currentExif.camera ||
                    currentExif.lens ||
                    currentExif.focal_length ||
                    currentExif.aperture ||
                    currentExif.shutter ||
                    currentExif.iso
                );

                if (!hasExif) {
                  return (
                    <div className="bg-foreground/[0.02] border border-foreground/10 rounded-2xl p-4 text-[11px] font-mono text-foreground/40 italic text-center">
                      EXIF metadata not embedded in file.
                    </div>
                  );
                }

                return (
                  <div className="bg-foreground/[0.02] border border-foreground/10 rounded-2xl p-4 sm:p-5 space-y-3.5">
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-foreground/60 flex items-center gap-2 border-b border-foreground/10 pb-2">
                      <Sliders className="h-3.5 w-3.5 text-primary" />
                      <span>EXIF DATA</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3.5">
                      {currentExif.camera && (
                        <div className="col-span-2 space-y-1">
                          <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-wider block">Camera</span>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <Camera className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate">{currentExif.camera}</span>
                          </div>
                        </div>
                      )}

                      {currentExif.lens && (
                        <div className="col-span-2 space-y-1">
                          <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-wider block">Lens</span>
                          <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="truncate">{currentExif.lens}</span>
                          </div>
                        </div>
                      )}

                      {currentExif.focal_length && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-wider block">Focal Length</span>
                          <span className="text-xs font-mono font-medium text-foreground">{currentExif.focal_length}</span>
                        </div>
                      )}

                      {currentExif.aperture && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-wider block">Aperture</span>
                          <span className="text-xs font-mono font-medium text-foreground">{currentExif.aperture}</span>
                        </div>
                      )}

                      {currentExif.shutter && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-wider block">Shutter</span>
                          <span className="text-xs font-mono font-medium text-foreground">{currentExif.shutter}</span>
                        </div>
                      )}

                      {currentExif.iso && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-wider block">ISO</span>
                          <span className="text-xs font-mono font-medium text-foreground">ISO {currentExif.iso}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Color Palette Spectrum */}
              {currentPhoto.color_palette && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-foreground/60">
                    SPECTRUM
                  </h3>
                  <ColorPalettePill colors={currentPhoto.color_palette} />
                </div>
              )}

              {/* Tags */}
              {currentPhoto.tags && currentPhoto.tags.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-foreground/60 flex items-center gap-1.5">
                    <Tag className="h-3 w-3" />
                    <span>TAGS</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPhoto.tags.map((tag) => (
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

            {/* Footer Close Action */}
            <div className="mt-6 pt-4 border-t border-foreground/10 flex items-center justify-between text-xs font-mono text-foreground/60">
              <span className="text-[9px] text-foreground/35 uppercase tracking-widest">
                DANI'S STILLS
              </span>
              <button
                onClick={onClose}
                className="text-xs font-mono text-foreground/70 hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer min-h-[36px]"
              >
                <span>Close</span>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
