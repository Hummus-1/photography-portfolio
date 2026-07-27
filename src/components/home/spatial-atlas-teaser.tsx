"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, ArrowRight, MapPin, Navigation, Globe2, Sparkles } from "lucide-react";
import { Album } from "@/lib/types";

export interface DestinationSpot {
  id: string;
  name: string;
  region: string;
  country: string;
  latFormatted: string;
  lngFormatted: string;
  slug: string;
  imageUrl?: string | null;
}

interface SpatialAtlasTeaserProps {
  albums?: Album[];
}

// Helper to format numeric coordinates into latitude/longitude string
function formatCoordinates(lat: number | null | undefined, lng: number | null | undefined) {
  if (lat == null || lng == null) {
    return { latFormatted: "0.00° N", lngFormatted: "0.00° E" };
  }
  const latFormatted = lat >= 0 ? `${lat.toFixed(2)}° N` : `${Math.abs(lat).toFixed(2)}° S`;
  const lngFormatted = lng >= 0 ? `${lng.toFixed(2)}° E` : `${Math.abs(lng).toFixed(2)}° W`;
  return { latFormatted, lngFormatted };
}

// Map ISO country codes to flag emojis
function getCountryFlag(isoCode?: string): string {
  if (!isoCode) return "🌐";
  const codePoints = isoCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function SpatialAtlasTeaser({ albums = [] }: SpatialAtlasTeaserProps) {
  // Extract real destination spots from published backend albums & location_path
  const realSpots: DestinationSpot[] = albums.map((album) => {
    const locPath = album.location_path || [];
    
    // Deepest node in hierarchy (e.g. Anaga, Disko Bay, Skógafoss)
    const spotNode = locPath.length > 0 ? locPath[locPath.length - 1] : null;
    const countryNode = locPath.find((n) => n.type === "country" || n.type === "sub-region");
    const regionNode = locPath.find((n) => n.type === "region" || n.type === "island");

    const spotName = spotNode ? spotNode.name : (album.location || album.title);
    const countryName = countryNode ? countryNode.name : "Global";
    const countryFlag = countryNode?.iso_code ? getCountryFlag(countryNode.iso_code) : "🌐";
    const regionName = regionNode ? regionNode.name : (spotNode?.name !== spotName ? spotNode?.name || "" : "");

    // Extract real GPS lat/lng from deepest node in location_path OR album lat/lng OR fallback
    const lat = spotNode?.lat ?? regionNode?.lat ?? countryNode?.lat ?? album.lat ?? 0;
    const lng = spotNode?.lng ?? regionNode?.lng ?? countryNode?.lng ?? album.lng ?? 0;

    const { latFormatted, lngFormatted } = formatCoordinates(lat, lng);

    return {
      id: album.id,
      name: spotName,
      region: regionName ? `${regionName}` : (album.location || countryName),
      country: `${countryName} ${countryFlag}`,
      latFormatted,
      lngFormatted,
      slug: album.slug,
      imageUrl: album.cover_image_url,
    };
  }).slice(0, 8);

  return (
    <section className="px-6 md:px-12 py-20 bg-foreground/[0.02] border-b border-foreground/10 relative overflow-hidden">
      {/* Ambient map grid pattern background */}
      <div className="absolute inset-0 bg-[radial-gradient(#888888_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Banner Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
              <Compass className="h-4 w-4 animate-spin-slow text-emerald-500" />
              <span>Geographic Spatial Atlas • Real DB Coordinates</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Spatial Coordinates & Global Destinations
            </h2>
            <p className="text-sm md:text-base font-sans text-foreground/75 leading-relaxed">
              Every photo series is dynamically linked to real latitude and longitude GPS coordinates stored in the database, organized by continents, volcanic landmasses, and geographic taxonomies.
            </p>
          </div>

          <div>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2.5 bg-foreground text-background px-7 py-3.5 rounded-full text-xs font-mono uppercase tracking-widest font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl cursor-pointer group"
            >
              <Globe2 className="h-4 w-4" />
              <span>Open Destinations Index</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Featured Coordinates Grid (Powered 100% by real DB data) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {realSpots.map((spot, idx) => (
            <motion.div
              key={spot.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Link
                href={`/album/${spot.slug}`}
                className="block p-5 rounded-2xl border border-foreground/10 bg-background/60 backdrop-blur-md hover:border-foreground/30 hover:bg-background/90 transition-all group shadow-sm h-full"
              >
                <div className="flex items-center justify-between text-xs font-mono text-foreground/60 uppercase tracking-widest mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-500" />
                    {spot.country}
                  </span>
                  <Navigation className="h-3.5 w-3.5 text-foreground/30 group-hover:text-foreground/80 transition-colors" />
                </div>

                <h4 className="font-serif text-lg font-bold text-foreground group-hover:text-foreground/90 transition-colors line-clamp-1">
                  {spot.name}
                </h4>

                <p className="text-xs text-foreground/60 font-sans mt-1 truncate">
                  {spot.region}
                </p>

                <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-between text-[11px] font-mono text-foreground/60">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5 text-emerald-500" />
                    LAT: {spot.latFormatted}
                  </span>
                  <span>LNG: {spot.lngFormatted}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
