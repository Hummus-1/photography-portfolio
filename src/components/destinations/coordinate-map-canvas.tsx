"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Album } from "@/lib/types";
import { resolveCoordinates } from "@/lib/location-coords";
import worldLandData from "@/data/world-land.json";
import { MapPin, ArrowRight, Compass, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";

interface CoordinateMapCanvasProps {
  albums: Album[];
  onSelectCountry?: (country: string) => void;
}

export function CoordinateMapCanvas({ albums, onSelectCountry }: CoordinateMapCanvasProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [hoveredAlbum, setHoveredAlbum] = useState<Album | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Convert lat/lng coordinates to percentage coordinates using standard WGS84 Equirectangular Projection
  const getCoordinatesPosition = (album: Album) => {
    const geo = resolveCoordinates(album.lat, album.lng, album.location_path, album.location);
    const x = ((geo.lng + 180) / 360) * 100;
    const y = ((90 - geo.lat) / 180) * 100;

    return {
      x: Math.max(3, Math.min(97, x)),
      y: Math.max(5, Math.min(95, y)),
      geo,
    };
  };

  // Convert GeoJSON polygon coordinates [lng, lat] to SVG path string (1000x500 viewport)
  const renderGeoJsonPath = (coordinates: number[][][]) => {
    return coordinates
      .map((ring) =>
        ring
          .map(([lng, lat], idx) => {
            const x = ((lng + 180) / 360) * 1000;
            const y = ((90 - lat) / 180) * 500;
            return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(" ") + " Z"
      )
      .join(" ");
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.4, 2.4));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.4, 1));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="relative w-full h-[520px] md:h-[620px] bg-foreground/[0.025] border border-foreground/15 rounded-3xl overflow-hidden backdrop-blur-sm transition-colors duration-400">
      
      {/* Map Control Toolbar */}
      <div className="absolute top-4 left-6 z-30 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-background/90 border border-foreground/15 backdrop-blur-md text-[10px] font-mono uppercase tracking-widest text-foreground shadow-md">
          <Compass className="h-3.5 w-3.5 text-foreground/80 animate-spin-slow" />
          <span>Real GeoJSON Cartographic Atlas</span>
        </div>
      </div>

      <div className="absolute top-4 right-6 z-30 flex items-center gap-1.5 bg-background/90 border border-foreground/15 backdrop-blur-md p-1 rounded-2xl shadow-md">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl hover:bg-foreground/10 text-foreground transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl hover:bg-foreground/10 text-foreground transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 rounded-xl hover:bg-foreground/10 text-foreground transition-colors"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Main Map Canvas Area with Dynamic GeoJSON SVG Projection */}
      <div
        className="relative w-full h-full transition-transform duration-500 ease-out origin-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg
          className="absolute inset-0 w-full h-full stroke-foreground/20 fill-foreground/10 pointer-events-none"
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
            </pattern>
          </defs>
          <rect width="1000" height="500" fill="url(#gridPattern)" />

          {/* Equator & Meridian Reference Lines */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.25" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.25" />

          {/* Dynamic Real GeoJSON Polygon Landmass Paths */}
          {worldLandData.features.map((feature, idx) => (
            <path
              key={idx}
              d={renderGeoJsonPath(feature.geometry.coordinates as number[][][])}
              className="hover:fill-foreground/20 transition-colors duration-300"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Location Pins Plotted 1:1 on GeoJSON Coordinates */}
        <div className="absolute inset-0 p-8">
          {albums.map((album) => {
            const { x, y, geo } = getCoordinatesPosition(album);
            const countryNode = album.location_path?.find((n) => n.type === "country");
            const countryName = countryNode?.name || album.location || "Global";
            const isHovered = hoveredAlbum?.id === album.id;
            const isSelected = selectedAlbum?.id === album.id;

            return (
              <div
                key={album.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                onMouseEnter={() => setHoveredAlbum(album)}
                onMouseLeave={() => setHoveredAlbum(null)}
              >
                {/* Pulsing Pin Button */}
                <button
                  onClick={() => {
                    setSelectedAlbum(album);
                    if (onSelectCountry) onSelectCountry(countryName);
                  }}
                  className="relative flex items-center justify-center focus:outline-none"
                >
                  <span className={`absolute inline-flex h-9 w-9 rounded-full bg-foreground/20 animate-ping ${isHovered || isSelected ? "opacity-100 scale-125" : "opacity-40"}`} />
                  <span className={`relative flex items-center justify-center h-5 w-5 rounded-full shadow-xl transition-transform duration-300 ${
                    isSelected ? "bg-foreground text-background scale-125 ring-4 ring-foreground/20" : "bg-foreground text-background group-hover:scale-125"
                  }`}>
                    <MapPin className="h-3 w-3" />
                  </span>
                </button>

                {/* Pin Tooltip Tag */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap px-3 py-1.5 rounded-xl bg-background/95 border border-foreground/20 shadow-xl backdrop-blur-md transition-all duration-300 pointer-events-none ${
                    isHovered && !selectedAlbum ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-1 scale-95"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground">
                    <span className="text-[10px] bg-foreground/10 px-1.5 py-0.5 rounded text-foreground/80">
                      {geo.countryCode}
                    </span>
                    <span>{countryName}</span>
                  </div>
                  <div className="text-[10px] font-mono text-foreground/60 tracking-wider">
                    {album.title} ({geo.lat.toFixed(1)}°, {geo.lng.toFixed(1)}°)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Location Modal Card Overlay */}
      {selectedAlbum && (
        <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-40 bg-background/95 border border-foreground/20 rounded-2xl shadow-2xl backdrop-blur-md p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase bg-foreground/10 text-foreground px-2 py-0.5 rounded">
                {resolveCoordinates(selectedAlbum.lat, selectedAlbum.lng, selectedAlbum.location_path, selectedAlbum.location).countryCode}
              </span>
              <span className="text-xs font-mono font-semibold text-foreground">
                {selectedAlbum.location_path
                  ? selectedAlbum.location_path[selectedAlbum.location_path.length - 1].name
                  : selectedAlbum.location}
              </span>
            </div>
            <button
              onClick={() => setSelectedAlbum(null)}
              className="p-1 rounded-full hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-foreground/5">
            <Image
              src={selectedAlbum.cover_image_url || "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=800"}
              alt={selectedAlbum.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-2">
            <h4 className="font-serif text-lg font-bold text-foreground">
              {selectedAlbum.title}
            </h4>
            <p className="text-xs text-foreground/75 leading-relaxed line-clamp-2 font-sans">
              {selectedAlbum.description}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-foreground/10">
            <span className="text-[10px] font-mono text-foreground/50">
              {new Date(selectedAlbum.date).getFullYear()} Archive
            </span>
            <Link
              href={`/album/${selectedAlbum.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-full text-xs font-mono uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity"
            >
              <span>Explore</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Footer Coordinates Bar */}
      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-foreground/40 border-t border-foreground/10 pt-3 pointer-events-none">
        <div>GeoJSON Dataset: WGS 84 Projection</div>
        <div className="hidden sm:block">Click location pins to open collection detail</div>
        <div>{albums.length} Spatial Nodes</div>
      </div>
    </div>
  );
}
