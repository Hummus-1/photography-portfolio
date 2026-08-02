"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Album } from "@/lib/types";
import { MapPin, ArrowRight, Sparkles, ChevronRight, ExternalLink, Images, Camera } from "lucide-react";
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
}

export function ConceptSynchronizedStage({ countryGroups, allAlbums, density }: ConceptSynchronizedStageProps) {
  const [activeAlbum, setActiveAlbum] = useState<Album>(allAlbums[0] || null);
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll-driven Intersection Observer: Auto update stage as user scrolls past items
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
        rootMargin: "-30% 0px -50% 0px",
        threshold: 0.1,
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

  return (
    <div className="w-full relative">
      {/* 2-Column Synchronized Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sticky Hero Stage */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <div className="bg-foreground/[0.02] border border-foreground/15 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-xl overflow-hidden relative">
            
            {/* Ambient Background Glow based on cover color palette */}
            {activeAlbum?.cover_color_palette?.[0] && (
              <div
                className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
                style={{ backgroundColor: activeAlbum.cover_color_palette[0] }}
              />
            )}

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
                    <div className="flex items-center flex-wrap gap-1 text-[11px] font-mono text-foreground/70 uppercase tracking-wider py-2 rounded-xl">
                      {activeAlbum.location_path.map((node, index) => (
                        <span key={node.id || index} className="flex items-center gap-1">
                          {index > 0 && <ChevronRight className="h-3 w-3 opacity-40" />}
                          <span className={index === activeAlbum.location_path!.length - 1 ? "text-film-amber font-bold" : ""}>
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
                        className="text-[10px] text-film-amber font-mono bg-film-amber/10 px-2 py-0.5 rounded border border-film-amber/20 hover:bg-film-amber/20 transition-colors flex items-center gap-1"
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
                    className="w-full inline-flex items-center justify-center gap-2 group bg-foreground text-background py-3.5 px-6 rounded-2xl text-xs font-mono uppercase tracking-widest font-semibold hover:opacity-90 transition-all shadow-md cursor-pointer"
                  >
                    <span>Explore Photo Series</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Scrollable Stream */}
        <div className="lg:col-span-7 space-y-10">
          {countryGroups.map((group) => {
            const isExpanded = expandedCountries[group.country];
            const displayLimit = isExpanded ? group.albums.length : 6;
            const visibleAlbums = group.albums.slice(0, displayLimit);
            const hasMore = group.albums.length > 6;

            return (
              <div key={group.country} className="space-y-4">
                
                {/* Country Chapter Header */}
                <div className="flex items-center justify-between border-b border-foreground/15 pb-3">
                  <div className="flex items-center gap-3">
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
                    const photosPreview = (album as any).photos ? (album as any).photos.slice(0, 3) : [];

                    return (
                      <div
                        key={album.id}
                        data-album-id={album.id}
                        ref={(el) => {
                          if (el) cardRefs.current.set(album.id, el);
                          else cardRefs.current.delete(album.id);
                        }}
                        onClick={() => setActiveAlbum(album)}
                        onMouseEnter={() => setActiveAlbum(album)}
                        className={`group cursor-pointer rounded-3xl border transition-all duration-300 ${
                          density === "compact" ? "p-3.5 space-y-2" : "p-5 space-y-3"
                        } ${
                          isActive
                            ? "bg-foreground/[0.05] border-foreground/40 shadow-lg ring-1 ring-foreground/20"
                            : "bg-foreground/[0.01] border-foreground/10 hover:border-foreground/25 hover:bg-foreground/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Cover Thumbnail */}
                          <div className={`relative rounded-2xl overflow-hidden shrink-0 border border-foreground/15 shadow-sm ${
                            density === "compact" ? "aspect-[4/3] w-20" : "aspect-[4/3] w-28 sm:w-32"
                          }`}>
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

                          {/* Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={`font-serif font-bold text-foreground truncate group-hover:text-foreground/90 ${
                                density === "compact" ? "text-base" : "text-xl"
                              }`}>
                                {album.title}
                              </h4>
                              <span className="text-[11px] font-mono text-foreground/40 shrink-0">
                                {album.date ? new Date(album.date).getFullYear() : "Pending"}
                              </span>
                            </div>

                            <div className="text-xs font-mono text-foreground/60 flex items-center gap-1.5 truncate">
                              <MapPin className="h-3 w-3 shrink-0 text-film-amber" />
                              <span className="truncate">{album.location}</span>
                            </div>

                            {/* Tags & Shot count */}
                            {density === "expanded" && (
                              <div className="flex items-center gap-2 pt-1 flex-wrap">
                                {album.tags?.slice(0, 3).map((t, idx) => (
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

                          {/* Arrow CTA */}
                          <div className="shrink-0 pl-2">
                            <Link
                              href={`/album/${album.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              title={`Open ${album.title} album`}
                              className={`p-3 rounded-full transition-all flex items-center justify-center ${
                                isActive
                                  ? "bg-foreground text-background hover:scale-110 shadow-sm"
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

                {/* Show More Button */}
                {hasMore && (
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => toggleExpand(group.country)}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-foreground/15 text-xs font-mono uppercase tracking-widest text-foreground/70 hover:border-foreground hover:text-foreground transition-colors cursor-pointer"
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
    </div>
  );
}
