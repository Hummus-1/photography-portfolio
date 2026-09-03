"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Album } from "@/lib/types";
import { selectBestAccentColor, getOnAccentColor } from "@/lib/color-utils";
import {
  MapPin,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Images,
  Camera,
  ChevronUp,
  ChevronDown,
  X,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ColorPalettePill } from "../color-palette-pill";

interface LocationGroup {
  country: string;
  continent: string;
  countryCode?: string;
  albums: Album[];
  regions: Set<string>;
  totalPhotos: number;
}

interface ConceptSynchronizedStageProps {
  countryGroups: LocationGroup[];
  allAlbums: Album[];
  density: "expanded" | "compact";
  selectedCountry?: string;
  onSelectCountry?: (country: string) => void;
  activeAlbum?: Album | null;
  onSelectAlbum?: (album: Album) => void;
}

export function ConceptSynchronizedStage({
  countryGroups,
  allAlbums,
  density,
  selectedCountry = "all",
  onSelectCountry,
  activeAlbum: externalActiveAlbum,
  onSelectAlbum: externalOnSelectAlbum,
}: ConceptSynchronizedStageProps) {
  const [internalActiveAlbum, setInternalActiveAlbum] = useState<Album>(allAlbums[0] || null);
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const activeAlbum = externalActiveAlbum !== undefined ? (externalActiveAlbum || allAlbums[0]) : internalActiveAlbum;
  const setActiveAlbum = (album: Album) => {
    if (externalOnSelectAlbum) {
      externalOnSelectAlbum(album);
    } else {
      setInternalActiveAlbum(album);
    }
  };

  const accentColor = useMemo(() => {
    if (!activeAlbum) return "#6184D8";
    return selectBestAccentColor(
      activeAlbum.cover_color_palette,
      "#6184D8",
      activeAlbum.custom_hero_color
    );
  }, [activeAlbum]);

  const buttonTextColor = useMemo(() => {
    return getOnAccentColor(accentColor);
  }, [accentColor]);

  // Keep active album in sync if allAlbums updates
  useEffect(() => {
    if (allAlbums.length && (!activeAlbum || !allAlbums.find((a) => a.id === activeAlbum.id))) {
      setActiveAlbum(allAlbums[0]);
    }
  }, [allAlbums, activeAlbum]);

  // Scroll-driven Intersection Observer for desktop & large viewports
  useEffect(() => {
    if (typeof window === "undefined" || !allAlbums.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const albumId = entry.target.getAttribute("data-album-id");
            if (albumId) {
              const found = allAlbums.find((a) => a.id === albumId);
              if (found) {
                setActiveAlbum(found);
              }
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "-25% 0px -45% 0px",
        threshold: 0.15,
      }
    );

    cardRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => {
      observer.disconnect();
    };
  }, [allAlbums, countryGroups, expandedCountries]);

  if (!allAlbums.length) return null;

  const toggleExpand = (country: string) => {
    setExpandedCountries((prev) => ({
      ...prev,
      [country]: !prev[country],
    }));
  };

  const handleSelectAlbum = (album: Album) => {
    setActiveAlbum(album);

    // If on mobile, open mobile preview drawer when clicked
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileSheetOpen(true);
    }

    // Scroll card smoothly into view if triggered via map or chip
    const cardEl = cardRefs.current.get(album.id);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="w-full relative space-y-8 pb-20">
      
      {/* 2-Column Synchronized Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sticky Hero Stage (Desktop View - Hidden on Small Mobile, Docked on Desktop) */}
        <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <div className="bg-foreground/[0.02] border border-foreground/15 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-xl overflow-hidden relative">
            
            {/* Ambient Background Glow based on dynamic accent color */}
            <div
              className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: accentColor }}
            />

            {/* Stage Cover Image */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border border-foreground/15 group z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeAlbum.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={
                      activeAlbum.cover_image_url ||
                      "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=1000"
                    }
                    alt={activeAlbum.title}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Stage Metadata */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAlbum.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 z-10 relative"
              >
                <div className="space-y-2">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {activeAlbum.title}
                  </h2>

                  {/* Location Path Breadcrumb */}
                  {activeAlbum.location_path && activeAlbum.location_path.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1 text-[11px] font-mono text-foreground/70 uppercase tracking-wider py-1.5 rounded-xl">
                      {activeAlbum.location_path.map((node, index) => (
                        <span key={node.id || index} className="flex items-center gap-1">
                          {index > 0 && <ChevronRight className="h-3 w-3 opacity-40" />}
                          <span
                            style={index === activeAlbum.location_path!.length - 1 ? { color: accentColor } : undefined}
                            className={index === activeAlbum.location_path!.length - 1 ? "font-bold" : ""}
                          >
                            {node.name}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-mono text-foreground/60">
                    {/* Google Maps Coordinates Link */}
                    {activeAlbum.lat != null && activeAlbum.lng != null && (
                      <a
                        href={`https://maps.google.com/?q=${activeAlbum.lat},${activeAlbum.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: accentColor, backgroundColor: `${accentColor}18`, borderColor: `${accentColor}33` }}
                        className="text-[10px] font-mono px-2.5 py-1 rounded border transition-colors flex items-center gap-1 hover:brightness-110"
                        title="View GPS Pin on Google Maps"
                      >
                        {activeAlbum.lat >= 0 ? `${activeAlbum.lat.toFixed(2)}° N` : `${Math.abs(activeAlbum.lat).toFixed(2)}° S`},{" "}
                        {activeAlbum.lng >= 0 ? `${activeAlbum.lng.toFixed(2)}° E` : `${Math.abs(activeAlbum.lng).toFixed(2)}° W`}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3 font-sans">
                  {activeAlbum.description}
                </p>

                {activeAlbum.cover_color_palette && (
                  <ColorPalettePill colors={activeAlbum.cover_color_palette} />
                )}

                <div className="pt-2">
                  <Link
                    href={`/album/${activeAlbum.slug}`}
                    style={{ 
                      backgroundColor: accentColor,
                      color: buttonTextColor,
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 group py-3.5 px-6 rounded-2xl text-xs font-mono uppercase tracking-widest font-semibold hover:opacity-90 active:scale-[0.99] transition-all shadow-md cursor-pointer"
                  >
                    <span>Explore Photo Series</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Scrollable Stream / Album Cards Column */}
        <div className="col-span-1 lg:col-span-7 space-y-8">
          {countryGroups.map((group) => {
            const isExpanded = expandedCountries[group.country];
            const displayLimit = isExpanded ? group.albums.length : 6;
            const visibleAlbums = group.albums.slice(0, displayLimit);
            const hasMore = group.albums.length > 6;

            return (
              <div key={group.country} className="space-y-4">
                
                {/* Country Chapter Header */}
                <div className="flex items-center justify-between border-b border-foreground/15 pb-3">
                  <div className="flex items-center gap-2.5">
                    {group.countryCode && (
                      <span className="text-xs font-mono bg-foreground/10 px-2.5 py-1 rounded-md text-foreground font-bold uppercase tracking-wider">
                        {group.countryCode}
                      </span>
                    )}
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      {group.country}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">
                    {group.albums.length} {group.albums.length === 1 ? "Series" : "Series"}
                  </span>
                </div>

                {/* Country Albums List */}
                <div className="space-y-3">
                  {visibleAlbums.map((album) => {
                    const isActive = activeAlbum?.id === album.id;

                    return (
                      <div
                        key={album.id}
                        data-album-id={album.id}
                        ref={(el) => {
                          if (el) cardRefs.current.set(album.id, el);
                          else cardRefs.current.delete(album.id);
                        }}
                        onClick={() => handleSelectAlbum(album)}
                        style={
                          isActive
                            ? {
                                borderColor: `${accentColor}80`,
                                boxShadow: `0 0 30px -5px ${accentColor}35`,
                              }
                            : undefined
                        }
                        className={`group cursor-pointer rounded-3xl border transition-all duration-300 active:scale-[0.99] ${
                          density === "compact" ? "p-3 sm:p-4 space-y-2" : "p-4 sm:p-5 space-y-3"
                        } ${
                          isActive
                            ? "bg-foreground/[0.05] ring-1"
                            : "bg-foreground/[0.01] border-foreground/10 hover:border-foreground/25 hover:bg-foreground/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          
                          {/* Cover Thumbnail */}
                          <div
                            className={`relative rounded-2xl overflow-hidden shrink-0 border border-foreground/15 shadow-sm ${
                              density === "compact"
                                ? "aspect-[4/3] w-20 sm:w-24"
                                : "aspect-[4/3] w-24 sm:w-32"
                            }`}
                          >
                            <Image
                              src={
                                album.cover_image_url ||
                                "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=400"
                              }
                              alt={album.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          {/* Album Card Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4
                                style={isActive ? { color: accentColor } : undefined}
                                className={`font-serif font-bold text-foreground truncate transition-colors ${
                                  density === "compact" ? "text-sm sm:text-base" : "text-base sm:text-xl"
                                }`}
                              >
                                {album.title}
                              </h4>
                              <span className="text-[10px] sm:text-[11px] font-mono text-foreground/40 shrink-0">
                                {album.date ? new Date(album.date).getFullYear() : ""}
                              </span>
                            </div>

                            <div className="text-xs font-mono text-foreground/60 flex items-center gap-1.5 truncate">
                              <MapPin
                                style={isActive ? { color: accentColor } : undefined}
                                className="h-3 w-3 shrink-0 transition-colors"
                              />
                              <span className="truncate">{album.location}</span>
                            </div>

                            {/* Tags & Shot count (Shown in Expanded mode) */}
                            {density === "expanded" && album.tags && album.tags.length > 0 && (
                              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                                {album.tags.slice(0, 3).map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] font-mono uppercase tracking-wider text-foreground/60 bg-foreground/5 px-2 py-0.5 rounded-full border border-foreground/10"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Direct Arrow Link CTA */}
                          <div className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <Link
                              href={`/album/${album.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              title={`Open ${album.title} album`}
                              style={isActive ? { backgroundColor: accentColor } : undefined}
                              className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                                isActive
                                  ? "text-white hover:scale-110 shadow-md"
                                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground hover:text-background hover:scale-110"
                              }`}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Show More / Collapse Button */}
                {hasMore && (
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => toggleExpand(group.country)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-foreground/15 text-xs font-mono uppercase tracking-widest text-foreground/70 hover:border-foreground hover:text-foreground transition-colors cursor-pointer min-h-[44px]"
                    >
                      <span>
                        {isExpanded
                          ? `Collapse (${group.albums.length})`
                          : `Show ${group.albums.length - 6} More in ${group.country}`}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* MOBILE STICKY FLOATING PREVIEW BAR & BOTTOM SHEET */}
      {activeAlbum && (
        <div className="block lg:hidden">
          
          {/* Floating Pill Bar at Bottom of Mobile Viewport */}
          <div className="fixed bottom-4 left-4 right-4 z-40">
            <div
              style={{ borderColor: `${accentColor}60` }}
              className="p-3 rounded-2xl bg-background/95 border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-foreground transition-colors duration-500"
            >
              
              {/* Thumbnail & Title */}
              <div
                onClick={() => setIsMobileSheetOpen(!isMobileSheetOpen)}
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              >
                <div className="relative aspect-square w-11 rounded-xl overflow-hidden border border-foreground/20 shrink-0">
                  <Image
                    src={
                      activeAlbum.cover_image_url ||
                      "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=200"
                    }
                    alt={activeAlbum.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div
                    style={{ color: accentColor }}
                    className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 truncate transition-colors duration-500"
                  >
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{activeAlbum.location}</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-foreground truncate">
                    {activeAlbum.title}
                  </h4>
                </div>
              </div>

              {/* Expand Sheet Toggle & Direct Album Link */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsMobileSheetOpen(!isMobileSheetOpen)}
                  className="p-2 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground/80 hover:text-foreground cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Toggle details sheet"
                >
                  {isMobileSheetOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>

                <Link
                  href={`/album/${activeAlbum.slug}`}
                  style={{ 
                    backgroundColor: accentColor,
                    color: buttonTextColor,
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 shadow min-h-[40px] hover:opacity-90 transition-opacity duration-300"
                >
                  <span>View</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Full Expanded Mobile Sheet Modal */}
          <AnimatePresence>
            {isMobileSheetOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileSheetOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                />

                {/* Slide-Up Sheet */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-foreground/15 rounded-t-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
                    <div
                      style={{ color: accentColor }}
                      className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest font-semibold transition-colors duration-500"
                    >
                      <Compass className="h-4 w-4" />
                      <span>Active Destination Preview</span>
                    </div>
                    <button
                      onClick={() => setIsMobileSheetOpen(false)}
                      className="p-2 rounded-full border border-foreground/10 text-foreground/60 hover:text-foreground cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-foreground/15 shadow-md">
                    <Image
                      src={
                        activeAlbum.cover_image_url ||
                        "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=800"
                      }
                      alt={activeAlbum.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-serif text-2xl font-bold text-foreground">
                      {activeAlbum.title}
                    </h3>

                    <div className="text-xs font-mono text-foreground/70 flex items-center gap-1.5">
                      <MapPin style={{ color: accentColor }} className="h-3.5 w-3.5 transition-colors duration-500" />
                      <span>{activeAlbum.location}</span>
                    </div>

                    <p className="text-xs text-foreground/80 leading-relaxed font-sans">
                      {activeAlbum.description}
                    </p>

                    {activeAlbum.cover_color_palette && (
                      <ColorPalettePill colors={activeAlbum.cover_color_palette} />
                    )}

                    <div className="pt-3">
                      <Link
                        href={`/album/${activeAlbum.slug}`}
                        style={{ 
                          backgroundColor: accentColor,
                          color: buttonTextColor,
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-xs font-mono uppercase tracking-widest font-semibold cursor-pointer shadow-md hover:opacity-90 transition-opacity duration-300"
                      >
                        <span>Explore Photo Series</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
