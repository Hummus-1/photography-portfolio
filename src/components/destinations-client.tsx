"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Album } from "@/lib/types";
import {
  MapPin,
  Globe,
  Search,
  Grid,
  ArrowRight,
  Compass,
  ChevronRight,
  Map as MapIcon,
  Table as TableIcon,
  Sparkles,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ColorPalettePill } from "./color-palette-pill";
import { CoordinateMapCanvas } from "./destinations/coordinate-map-canvas";

interface DestinationsClientProps {
  albums: Album[];
}

interface LocationGroup {
  country: string;
  continent: string;
  countryCode?: string;
  albums: Album[];
  regions: Set<string>;
  totalPhotos: number;
}

export function DestinationsClient({ albums }: DestinationsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"magazine" | "canvas" | "table">("magazine");
  const [activeSpotlightIndex, setActiveSpotlightIndex] = useState<number>(0);
  const [hoveredTableAlbum, setHoveredTableAlbum] = useState<Album | null>(null);

  // Group albums by country and extract location metadata
  const { countryGroups, countriesList, totalSpots } = useMemo(() => {
    const groups: { [key: string]: LocationGroup } = {};
    const spotsSet = new Set<string>();

    albums.forEach((album) => {
      const path = album.location_path || [];
      const continentNode = path.find((n) => n.type === "continent");
      const countryNode = path.find((n) => n.type === "country");

      let countryName = countryNode?.name;
      let continentName = continentNode?.name || "Global";

      if (!countryName) {
        if (album.location && album.location.includes(",")) {
          const parts = album.location.split(",").map((p) => p.trim());
          countryName = parts[parts.length - 1];
        } else {
          countryName = album.location || "Uncategorized";
        }
      }

      path.forEach((n) => {
        if (n.type !== "continent" && n.type !== "country") {
          spotsSet.add(n.name);
        }
      });

      if (!groups[countryName]) {
        groups[countryName] = {
          country: countryName,
          continent: continentName,
          countryCode: countryNode?.iso_code || album.country_code,
          albums: [],
          regions: new Set<string>(),
          totalPhotos: 0,
        };
      }

      groups[countryName].albums.push(album);

      path.forEach((n) => {
        if (n.type === "region" || n.type === "island" || n.type === "spot") {
          groups[countryName].regions.add(n.name);
        }
      });
    });

    return {
      countryGroups: groups,
      countriesList: Object.keys(groups).sort(),
      totalSpots: spotsSet.size,
    };
  }, [albums]);

  // Filter groups by search & active country pill
  const filteredCountryGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return Object.values(countryGroups).filter((group) => {
      if (selectedCountry !== "all" && group.country.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }

      if (!q) return true;

      if (group.country.toLowerCase().includes(q) || group.continent.toLowerCase().includes(q)) {
        return true;
      }

      const matchesRegion = Array.from(group.regions).some((r) => r.toLowerCase().includes(q));
      if (matchesRegion) return true;

      return group.albums.some(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [countryGroups, searchQuery, selectedCountry]);

  // Spotlight album selection
  const spotlightAlbum = useMemo(() => {
    if (albums.length === 0) return null;
    return albums[activeSpotlightIndex % albums.length];
  }, [albums, activeSpotlightIndex]);

  return (
    <div className="w-full min-h-screen pb-24">
      {/* Dynamic Spotlight Editorial Banner */}
      {spotlightAlbum && (
        <section className="relative px-6 md:px-12 py-16 md:py-24 border-b border-foreground/10 bg-foreground/[0.01] overflow-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Spotlight Details */}
            <div className="lg:col-span-6 space-y-6 z-10">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase bg-foreground/10 text-foreground px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3 text-foreground/80" />
                  Featured Destination Spotlight
                </span>
                {spotlightAlbum.country_code && (
                  <span className="text-[10px] font-mono border border-foreground/20 px-2 py-0.5 rounded text-foreground/60 uppercase">
                    {spotlightAlbum.country_code}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-4xl md:text-7xl font-bold tracking-tight text-foreground leading-none">
                {spotlightAlbum.location_path && spotlightAlbum.location_path.length > 0
                  ? spotlightAlbum.location_path[spotlightAlbum.location_path.length - 1].name
                  : spotlightAlbum.location}
              </h1>

              <div className="flex items-center gap-3 text-xs font-mono text-foreground/60">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {spotlightAlbum.location_path
                    ? spotlightAlbum.location_path.map((n) => n.name).join(" / ")
                    : spotlightAlbum.location}
                </span>
                {spotlightAlbum.lat && spotlightAlbum.lng && (
                  <span className="opacity-50">
                    ({spotlightAlbum.lat.toFixed(2)}°, {spotlightAlbum.lng.toFixed(2)}°)
                  </span>
                )}
              </div>

              <p className="text-base text-foreground/80 font-sans leading-relaxed line-clamp-3">
                {spotlightAlbum.description}
              </p>

              <ColorPalettePill colors={spotlightAlbum.cover_color_palette} />

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href={`/album/${spotlightAlbum.slug}`}
                  className="inline-flex items-center gap-2 group bg-foreground text-background px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity"
                >
                  <span>Explore Series</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Next Spotlight Switcher */}
                <button
                  onClick={() => setActiveSpotlightIndex((prev) => (prev + 1) % albums.length)}
                  className="px-4 py-3 rounded-full border border-foreground/20 hover:border-foreground text-xs font-mono uppercase tracking-widest text-foreground/70 transition-colors"
                >
                  Next Destination ({activeSpotlightIndex + 1}/{albums.length})
                </button>
              </div>
            </div>

            {/* Right Hero Cover Photo */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-foreground/15 group">
                <Image
                  src={
                    spotlightAlbum.cover_image_url ||
                    "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=1200"
                  }
                  alt={spotlightAlbum.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-mono">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <Camera className="h-3.5 w-3.5" />
                    <span>{spotlightAlbum.title}</span>
                  </div>
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    {new Date(spotlightAlbum.date).getFullYear()}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Filter & Toolbar Controls */}
      <section className="sticky top-20 z-40 px-6 md:px-12 py-4 border-b border-foreground/10 bg-background/80 backdrop-blur-md transition-colors duration-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Search destination, country, spot, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-mono bg-foreground/[0.03] border border-foreground/15 rounded-full placeholder:text-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </div>

          {/* Country Filter Pills & View Modes */}
          <div className="flex items-center justify-between md:justify-end gap-4 overflow-x-auto pb-1 md:pb-0">
            {/* Country Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setSelectedCountry("all")}
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider transition-all ${
                  selectedCountry === "all"
                    ? "bg-foreground text-background font-semibold"
                    : "bg-foreground/5 hover:bg-foreground/10 text-foreground/70"
                }`}
              >
                All ({countriesList.length})
              </button>
              {countriesList.map((country) => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                    selectedCountry === country
                      ? "bg-foreground text-background font-semibold"
                      : "bg-foreground/5 hover:bg-foreground/10 text-foreground/70"
                  }`}
                >
                  {country} ({countryGroups[country]?.albums.length || 0})
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-foreground/15 hidden md:block" />

            {/* View Mode Switcher */}
            <div className="flex items-center bg-foreground/[0.05] p-1 rounded-xl border border-foreground/10">
              <button
                onClick={() => setViewMode("magazine")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                  viewMode === "magazine"
                    ? "bg-background text-foreground shadow-sm font-bold"
                    : "text-foreground/50 hover:text-foreground"
                }`}
                title="Editorial Magazine View"
              >
                <Grid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Magazine</span>
              </button>

              <button
                onClick={() => setViewMode("canvas")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                  viewMode === "canvas"
                    ? "bg-background text-foreground shadow-sm font-bold"
                    : "text-foreground/50 hover:text-foreground"
                }`}
                title="Spatial Coordinates Map"
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Atlas</span>
              </button>

              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-sm font-bold"
                    : "text-foreground/50 hover:text-foreground"
                }`}
                title="Editorial Index Table View"
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Index</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="px-6 md:px-12 py-12 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {filteredCountryGroups.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-24 text-center space-y-4"
            >
              <Compass className="h-12 w-12 mx-auto text-foreground/30 animate-pulse" />
              <h3 className="font-serif text-2xl font-bold text-foreground">
                No destinations match your filter
              </h3>
              <p className="text-sm font-mono text-foreground/60 max-w-sm mx-auto">
                Try adjusting your search query or reset the country selection.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCountry("all");
                }}
                className="mt-4 px-4 py-2 border border-foreground/20 text-xs font-mono uppercase tracking-widest hover:border-foreground transition-colors"
              >
                Reset Filters
              </button>
            </motion.div>
          ) : viewMode === "canvas" ? (
            /* VIEW 1: Spatial Coordinate Atlas Map */
            <motion.div
              key="canvas"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <CoordinateMapCanvas
                albums={filteredCountryGroups.flatMap((g) => g.albums)}
                onSelectCountry={(country) => setSelectedCountry(country)}
              />
            </motion.div>
          ) : viewMode === "table" ? (
            /* VIEW 2: Editorial Index Table View */
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative space-y-6 font-mono"
            >
              <div className="flex items-center justify-between border-b border-foreground/15 pb-4 text-xs text-foreground/50 uppercase tracking-widest">
                <span>Destination Index / Location Path</span>
                <span>Coordinates & Year</span>
              </div>

              <div className="divide-y divide-foreground/10 border border-foreground/10 rounded-2xl overflow-hidden bg-foreground/[0.01]">
                {filteredCountryGroups.flatMap((group) =>
                  group.albums.map((album) => (
                    <div
                      key={album.id}
                      onMouseEnter={() => setHoveredTableAlbum(album)}
                      onMouseLeave={() => setHoveredTableAlbum(null)}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-foreground/[0.04] transition-colors gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          {album.country_code && (
                            <span className="text-[10px] bg-foreground/10 px-1.5 py-0.5 rounded text-foreground/80">
                              {album.country_code}
                            </span>
                          )}
                          <Link
                            href={`/album/${album.slug}`}
                            className="font-serif text-lg font-bold text-foreground group-hover:text-foreground/80 transition-colors"
                          >
                            {album.title}
                          </Link>
                        </div>

                        {album.location_path && (
                          <div className="text-[11px] text-foreground/50 flex items-center gap-1">
                            {album.location_path.map((n, idx) => (
                              <span key={n.id || idx} className="flex items-center gap-1">
                                {idx > 0 && <ChevronRight className="h-3 w-3 opacity-40" />}
                                <span>{n.name}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-xs text-foreground/60">
                        {album.lat && album.lng && (
                          <span className="text-[10px] opacity-70">
                            {album.lat.toFixed(2)}°, {album.lng.toFixed(2)}°
                          </span>
                        )}
                        <span>
                          {new Date(album.date).getFullYear()}
                        </span>
                        <Link
                          href={`/album/${album.slug}`}
                          className="px-3 py-1 bg-foreground/5 group-hover:bg-foreground group-hover:text-background rounded text-[10px] uppercase tracking-widest transition-colors flex items-center gap-1 font-semibold"
                        >
                          <span>View</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Floating Image Preview Tooltip for Table Hover */}
              {hoveredTableAlbum && hoveredTableAlbum.cover_image_url && (
                <div className="fixed bottom-8 right-8 z-50 pointer-events-none hidden lg:block w-72 rounded-2xl overflow-hidden shadow-2xl border border-foreground/20 bg-background/90 backdrop-blur-md p-2">
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
                    <Image
                      src={hoveredTableAlbum.cover_image_url}
                      alt={hoveredTableAlbum.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3 text-[11px] font-mono text-foreground space-y-1">
                    <div className="font-bold">{hoveredTableAlbum.title}</div>
                    <div className="text-foreground/60">{hoveredTableAlbum.location}</div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* VIEW 3: Editorial Magazine Grid */
            <motion.div
              key="magazine"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              {filteredCountryGroups.map((group) => (
                <section key={group.country} className="space-y-6">
                  {/* Country Header */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-foreground/15 pb-4 gap-2">
                    <div className="flex items-center gap-3">
                      {group.countryCode && (
                        <span className="text-xs font-mono uppercase tracking-widest bg-foreground/10 px-2 py-0.5 rounded text-foreground font-bold">
                          {group.countryCode}
                        </span>
                      )}
                      <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                        {group.country}
                      </h2>
                      <span className="text-xs font-mono uppercase tracking-widest text-foreground/50 border border-foreground/10 px-2 py-0.5 rounded">
                        {group.continent}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-foreground/50 uppercase tracking-widest flex items-center gap-4">
                      <span>{group.albums.length} {group.albums.length === 1 ? "Collection" : "Collections"}</span>
                      {group.regions.size > 0 && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-foreground/30" />
                          <span>{Array.from(group.regions).join(" • ")}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Album Magazine Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {group.albums.map((album) => (
                      <article
                        key={album.id}
                        className="group flex flex-col bg-foreground/[0.015] border border-foreground/10 rounded-2xl overflow-hidden hover:border-foreground/30 transition-all duration-300 hover:shadow-lg"
                      >
                        {/* Cover Image */}
                        <Link
                          href={`/album/${album.slug}`}
                          className="relative aspect-[16/10] overflow-hidden bg-foreground/5 block"
                        >
                          <Image
                            src={
                              album.cover_image_url ||
                              "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=800"
                            }
                            alt={album.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                          {/* Floating Location Badge */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-mono tracking-wider">
                            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                              <MapPin className="h-3 w-3" />
                              {album.location_path && album.location_path.length > 0
                                ? album.location_path[album.location_path.length - 1].name
                                : album.location}
                            </span>
                            <span className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                              {new Date(album.date).getFullYear()}
                            </span>
                          </div>
                        </Link>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                          <div className="space-y-3">
                            {/* Location Path Breadcrumbs */}
                            {album.location_path && album.location_path.length > 0 && (
                              <div className="flex items-center flex-wrap gap-1 text-[10px] font-mono text-foreground/50 uppercase tracking-wider">
                                {album.location_path.map((node, index) => (
                                  <span key={node.id || index} className="flex items-center gap-1">
                                    {index > 0 && <ChevronRight className="h-2.5 w-2.5 opacity-40" />}
                                    <span className={index === album.location_path!.length - 1 ? "text-foreground/80 font-semibold" : ""}>
                                      {node.name}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            )}

                            <h3 className="font-serif text-xl font-bold tracking-tight text-foreground group-hover:text-foreground/80 transition-colors">
                              <Link href={`/album/${album.slug}`}>
                                {album.title}
                              </Link>
                            </h3>

                            <ColorPalettePill colors={album.cover_color_palette} />

                            <p className="text-xs text-foreground/75 leading-relaxed line-clamp-2">
                              {album.description}
                            </p>
                          </div>

                          {/* Footer */}
                          <div className="pt-4 border-t border-foreground/10 flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {album.tags?.slice(0, 3).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[9px] font-mono uppercase tracking-wider text-foreground/50 border border-foreground/10 px-1.5 py-0.5 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <Link
                              href={`/album/${album.slug}`}
                              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors group/link"
                            >
                              <span>Explore</span>
                              <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
