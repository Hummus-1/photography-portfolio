"use client";

import { useState, useMemo } from "react";
import { Album } from "@/lib/types";
import {
  Search,
  Compass,
  ArrowUpDown,
  Maximize2,
  Minimize2,
  MapPin,
  RotateCcw,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConceptSynchronizedStage } from "./destinations/concept-synchronized-stage";

interface DestinationsClientProps {
  albums: Album[];
}

export interface LocationGroup {
  country: string;
  continent: string;
  countryCode?: string;
  albums: Album[];
  regions: Set<string>;
  totalPhotos: number;
}

// Convert ISO 2-letter country code into flag emoji
function getCountryFlag(isoCode?: string): string {
  if (!isoCode) return "🌐";
  const codePoints = isoCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function DestinationsClient({ albums }: DestinationsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alphabetical" | "most_spots">("newest");
  const [density, setDensity] = useState<"expanded" | "compact">("expanded");
  const [activeAlbumId, setActiveAlbumId] = useState<string>(albums[0]?.id || "");

  const activeAlbum = useMemo(() => {
    return albums.find((a) => a.id === activeAlbumId) || albums[0] || null;
  }, [albums, activeAlbumId]);

  // Group albums by country & extract continents list
  const { countryGroups, continentsList, countriesList } = useMemo(() => {
    const groups: { [key: string]: LocationGroup } = {};
    const continentsSet = new Set<string>();

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

      continentsSet.add(continentName);

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
      continentsList: Array.from(continentsSet).sort(),
      countriesList: Object.keys(groups).sort(),
    };
  }, [albums]);

  // Filter & Sort Country Groups
  const filteredCountryGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    let result = Object.values(countryGroups).filter((group) => {
      // Continent filter
      if (selectedContinent !== "all" && group.continent.toLowerCase() !== selectedContinent.toLowerCase()) {
        return false;
      }

      // Country filter
      if (selectedCountry !== "all" && group.country.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }

      // Search query
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

    // Apply Sorting
    return result.sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.country.localeCompare(b.country);
      }
      if (sortBy === "most_spots") {
        return b.albums.length - a.albums.length;
      }
      if (sortBy === "oldest") {
        const dateA = new Date(a.albums[0]?.date || 0).getTime();
        const dateB = new Date(b.albums[0]?.date || 0).getTime();
        return dateA - dateB;
      }
      // default: newest
      const dateA = new Date(a.albums[0]?.date || 0).getTime();
      const dateB = new Date(b.albums[0]?.date || 0).getTime();
      return dateB - dateA;
    });
  }, [countryGroups, searchQuery, selectedContinent, selectedCountry, sortBy]);

  // Flattened filtered albums
  const filteredAlbums = useMemo(() => {
    return filteredCountryGroups.flatMap((g) => g.albums);
  }, [filteredCountryGroups]);

  const hasActiveFilters = searchQuery !== "" || selectedContinent !== "all" || selectedCountry !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedContinent("all");
    setSelectedCountry("all");
  };

  return (
    <div className="w-full min-h-screen pb-24 space-y-6 sm:space-y-8">
      {/* Global Expedition Header */}
      <section className="px-4 sm:px-6 md:px-12 max-w-6xl mx-auto pt-6 sm:pt-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-foreground/10 pb-6 sm:pb-8 gap-6">
          <div className="space-y-3">
            <div className="text-[11px] sm:text-xs font-mono tracking-widest uppercase text-primary font-semibold flex items-center gap-2">
              <Compass className="h-4 w-4 animate-spin-slow text-primary shrink-0" />
              <span>02 • Spatial Index & Location Archive</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              Spatial Index
            </h1>
            <p className="text-xs sm:text-sm font-sans text-foreground/75 max-w-xl leading-relaxed">
              Geographic photo series indexed by continent, country, volcanic landmass, and verified GPS coordinates.
            </p>
          </div>

          <div className="flex items-center justify-around sm:justify-start gap-4 sm:gap-6 text-xs font-mono text-foreground/70 border border-foreground/15 px-4 sm:px-6 py-3 rounded-2xl bg-foreground/[0.015] shadow-sm">
            <div className="text-center">
              <span className="block font-bold text-primary text-base sm:text-lg">{albums.length}</span>
              <span className="text-[10px] text-foreground/50 uppercase tracking-wider">Series</span>
            </div>
            <div className="h-7 w-px bg-foreground/10" />
            <div className="text-center">
              <span className="block font-bold text-foreground text-base sm:text-lg">{countriesList.length}</span>
              <span className="text-[10px] text-foreground/50 uppercase tracking-wider">Countries</span>
            </div>
            <div className="h-7 w-px bg-foreground/10" />
            <div className="text-center">
              <span className="block font-bold text-foreground text-base sm:text-lg">{continentsList.length}</span>
              <span className="text-[10px] text-foreground/50 uppercase tracking-wider">Continents</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Toolbar (Search + Selectors + Country & Continent Ribbons) */}
      <section className="px-4 sm:px-6 md:px-12 max-w-6xl mx-auto">
        <div className="p-3.5 sm:p-5 rounded-3xl border border-foreground/10 bg-foreground/[0.015] space-y-3.5 shadow-sm">
          
          {/* Top Row: Search Input + Selectors + Density Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search destinations, spots, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 sm:h-10 w-full pl-10 pr-9 text-xs font-mono uppercase tracking-wider bg-background/60 border border-foreground/15 rounded-full placeholder:text-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Country Selector */}
            <div className="w-full md:w-[210px] shrink-0">
              <Select
                value={selectedCountry}
                onValueChange={(val) => {
                  if (val) setSelectedCountry(val);
                }}
              >
                <SelectTrigger className="h-11 sm:h-10 w-full rounded-full text-xs font-mono bg-background/60 border-foreground/15 min-h-[44px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <SelectValue placeholder="All Countries" />
                  </div>
                </SelectTrigger>
                <SelectContent className="font-mono text-xs max-h-60">
                  <SelectItem value="all">All Countries ({countriesList.length})</SelectItem>
                  {countriesList.map((c) => (
                    <SelectItem key={c} value={c}>
                      {getCountryFlag(countryGroups[c]?.countryCode)} {c} ({countryGroups[c]?.albums.length || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Selector */}
            <div className="w-full md:w-[185px] shrink-0">
              <Select
                value={sortBy}
                onValueChange={(val) => {
                  if (val) setSortBy(val as any);
                }}
              >
                <SelectTrigger className="h-11 sm:h-10 w-full rounded-full text-xs font-mono bg-background/60 border-foreground/15 min-h-[44px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <ArrowUpDown className="h-3.5 w-3.5 text-foreground/50 shrink-0" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent className="font-mono text-xs">
                  <SelectItem value="newest">Sort: Newest</SelectItem>
                  <SelectItem value="oldest">Sort: Oldest</SelectItem>
                  <SelectItem value="alphabetical">Sort: Country (A-Z)</SelectItem>
                  <SelectItem value="most_spots">Sort: Most Spots</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Density Toggle Button */}
            <button
              onClick={() => setDensity(density === "expanded" ? "compact" : "expanded")}
              className="h-11 sm:h-10 px-4 bg-background/60 border border-foreground/15 rounded-full text-xs font-mono text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] transition-colors shrink-0 cursor-pointer flex items-center justify-center gap-2 min-h-[44px] whitespace-nowrap"
              title="Toggle Layout Density"
            >
              {density === "expanded" ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5 text-foreground/60" />
                  <span>Compact</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5 text-foreground/60" />
                  <span>Expanded</span>
                </>
              )}
            </button>

          </div>

          {/* Middle Row: Country Chips Ribbon */}
          <div className="relative pt-2 border-t border-foreground/10">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
              <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest mr-1 shrink-0">
                Countries:
              </span>
              <button
                onClick={() => setSelectedCountry("all")}
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer min-h-[34px] ${
                  selectedCountry === "all"
                    ? "bg-foreground text-background font-bold"
                    : "bg-foreground/5 hover:bg-foreground/10 text-foreground/70"
                }`}
              >
                All ({countriesList.length})
              </button>
              {countriesList.map((c) => {
                const code = countryGroups[c]?.countryCode;
                const flag = getCountryFlag(code);
                const isSelected = selectedCountry.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCountry(c)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer min-h-[34px] ${
                      isSelected
                        ? "bg-primary text-white font-bold shadow-sm"
                        : "bg-foreground/5 hover:bg-foreground/10 text-foreground/70 border border-foreground/10"
                    }`}
                  >
                    <span>{flag}</span>
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Continent Tabs Ribbon */}
          <div className="flex items-center justify-between pt-2 border-t border-foreground/10 gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
              <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest mr-1 shrink-0">
                Continents:
              </span>
              <button
                onClick={() => {
                  setSelectedContinent("all");
                  setSelectedCountry("all");
                }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer min-h-[34px] ${
                  selectedContinent === "all"
                    ? "bg-foreground text-background font-bold"
                    : "bg-foreground/5 hover:bg-foreground/10 text-foreground/70"
                }`}
              >
                All Continents
              </button>
              {continentsList.map((continent) => (
                <button
                  key={continent}
                  onClick={() => {
                    setSelectedContinent(continent);
                    setSelectedCountry("all");
                  }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer min-h-[34px] ${
                    selectedContinent === continent
                      ? "bg-foreground text-background font-bold"
                      : "bg-foreground/5 hover:bg-foreground/10 text-foreground/70"
                  }`}
                >
                  {continent}
                </button>
              ))}
            </div>

            {/* Instant Reset Filters Button when active */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-full border border-primary/30 text-primary text-[10px] font-mono uppercase tracking-wider hover:bg-primary/10 transition-colors shrink-0 flex items-center gap-1 cursor-pointer min-h-[34px]"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="px-4 sm:px-6 md:px-12 max-w-6xl mx-auto pt-2">
        {filteredCountryGroups.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <Compass className="h-12 w-12 mx-auto text-foreground/30 animate-pulse" />
            <h3 className="font-serif text-2xl font-bold text-foreground">
              No destinations match your filter
            </h3>
            <p className="text-sm font-mono text-foreground/60 max-w-sm mx-auto">
              Try adjusting your search query or reset continent/country selection.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-5 py-2.5 border border-foreground/20 text-xs font-mono uppercase tracking-widest hover:border-foreground transition-colors rounded-full cursor-pointer min-h-[44px]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <ConceptSynchronizedStage
            countryGroups={filteredCountryGroups}
            allAlbums={filteredAlbums}
            density={density}
            activeAlbum={activeAlbum}
            onSelectAlbum={(album) => setActiveAlbumId(album.id)}
          />
        )}
      </main>
    </div>
  );
}
