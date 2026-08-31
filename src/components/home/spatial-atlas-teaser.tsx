"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, ArrowRight, MapPin, Navigation, Globe2, Film } from "lucide-react";
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
  const realSpots: DestinationSpot[] = albums
    .map((album) => {
      const locPath = album.location_path || [];

      // Deepest node in hierarchy (e.g. Anaga, Disko Bay, Skógafoss)
      const spotNode = locPath.length > 0 ? locPath[locPath.length - 1] : null;
      const countryNode = locPath.find((n) => n.type === "country" || n.type === "sub-region");
      const regionNode = locPath.find((n) => n.type === "region" || n.type === "island");

      const spotName = spotNode ? spotNode.name : album.location || album.title;
      const countryName = countryNode ? countryNode.name : "Global";
      const countryFlag = countryNode?.iso_code ? getCountryFlag(countryNode.iso_code) : "🌐";
      const regionName = regionNode ? regionNode.name : spotNode?.name !== spotName ? spotNode?.name || "" : "";

      // Extract real GPS lat/lng
      const lat = spotNode?.lat ?? regionNode?.lat ?? countryNode?.lat ?? album.lat ?? 0;
      const lng = spotNode?.lng ?? regionNode?.lng ?? countryNode?.lng ?? album.lng ?? 0;

      const { latFormatted, lngFormatted } = formatCoordinates(lat, lng);

      return {
        id: album.id,
        name: spotName,
        region: regionName ? `${regionName}` : album.location || countryName,
        country: `${countryName} ${countryFlag}`,
        latFormatted,
        lngFormatted,
        slug: album.slug,
        imageUrl: album.cover_image_url,
      };
    })
    .slice(0, 4);

  return (
    <section className="px-4 sm:px-6 md:px-12 py-16 sm:py-24 md:py-32 bg-foreground/[0.015] border-b border-foreground/10 relative overflow-hidden">
      {/* Ambient Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#888888_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.08] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-16 relative z-10">
        
        {/* Specimen Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-baseline border-b border-foreground/10 pb-6 sm:pb-8">
          
          <div className="md:col-span-3 flex items-center gap-3 text-xs font-mono tracking-widest uppercase text-foreground/50">
            <span className="text-primary font-bold flex items-center gap-1">
              <Film className="h-3.5 w-3.5" />
              03
            </span>
            <span className="w-6 h-px bg-foreground/20" />
            <span>Spatial Index</span>
          </div>

          <div className="md:col-span-9 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                <Compass className="h-4 w-4 shrink-0" />
                <span>Geographic Index • Expedition Coordinates</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Expedition Coordinates & Locations
              </h2>
              <p className="text-xs sm:text-sm md:text-base font-sans text-foreground/75 leading-relaxed">
                Each photographic series is geotagged with exact geographic coordinates, mapped across volcanic islands, coastal headlands, and sub-arctic wilderness.
              </p>
            </div>

            <div>
              <Link
                href="/destinations"
                className="inline-flex items-center justify-center gap-2.5 bg-foreground text-background px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-xs font-mono uppercase tracking-widest font-semibold hover:bg-primary hover:text-white active:scale-[0.98] transition-all shadow-md cursor-pointer group min-h-[44px] w-full sm:w-auto"
              >
                <Globe2 className="h-4 w-4" />
                <span>Destinations Index</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

        {/* Featured Spatial Coordinates Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {realSpots.map((spot, idx) => (
            <motion.div
              key={spot.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <Link
                href={`/album/${spot.slug}`}
                className="block p-5 sm:p-6 rounded-2xl border border-foreground/15 bg-background/70 backdrop-blur-md hover:border-primary/50 hover:shadow-lg transition-all active:scale-[0.99] group h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-foreground/60 uppercase tracking-widest mb-3">
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{spot.country}</span>
                    </span>
                    <Navigation className="h-3.5 w-3.5 text-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {spot.name}
                  </h3>

                  <p className="text-xs text-foreground/60 font-sans mt-1 truncate">
                    {spot.region}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-foreground/10 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-foreground/60">
                  <span>LAT: {spot.latFormatted}</span>
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
