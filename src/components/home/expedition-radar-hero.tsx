"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Compass, Play, Pause, ZoomIn, ZoomOut, ArrowDown } from "lucide-react";
import { Album, Photo } from "@/lib/types";
import { selectBestAccentColor } from "@/lib/color-utils";

export interface ExpeditionRadarHeroProps {
  albums?: (Album & { photos?: Photo[] })[];
}

export interface RealRadarWaypoint {
  id: string;
  name: string;
  region: string;
  country: string;
  countryCode: string;
  coords: string;
  lat: number | null;
  lng: number | null;
  hasGps: boolean;
  bearing: number; // degrees 0-360
  distanceKm: number; // distance in km from dynamic centroid
  photoUrl: string | null;
  albumSlug: string;
  palette: string[];
  accentColor: string;
  photoCount: number;
}

// Calculate spherical distance (Haversine) and initial bearing from reference center
function calculateBearingAndDistance(
  targetLat: number,
  targetLng: number,
  refLat: number,
  refLng: number
): { bearing: number; distanceKm: number } {
  const dLat = ((targetLat - refLat) * Math.PI) / 180;
  const dLng = ((targetLng - refLng) * Math.PI) / 180;
  const lat1 = (refLat * Math.PI) / 180;
  const lat2 = (targetLat * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(6371 * c);

  // Initial geodesic bearing
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  return { bearing: Math.round(brng), distanceKm };
}

// Format coordinates into standard latitude / longitude display
function formatCoords(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return "GPS Pending";
  const latStr = lat >= 0 ? `${lat.toFixed(2)}°N` : `${Math.abs(lat).toFixed(2)}°S`;
  const lngStr = lng >= 0 ? `${lng.toFixed(2)}°E` : `${Math.abs(lng).toFixed(2)}°W`;
  return `${latStr} · ${lngStr}`;
}

export function ExpeditionRadarHero({ albums = [] }: ExpeditionRadarHeroProps) {
  // 1. Extract real data directly from published database albums
  const { waypoints, centroidLat, centroidLng, maxRealDistance } = useMemo(() => {
    if (!albums || albums.length === 0) {
      return { waypoints: [], centroidLat: 0, centroidLng: 0, maxRealDistance: 1000 };
    }

    // Step A: Extract all coordinate points to calculate dynamic centroid
    const validGpsList: { lat: number; lng: number }[] = [];

    const rawParsed = albums.map((alb, index) => {
      // Find GPS from album fields or location_path or photos EXIF
      const locPath = alb.location_path || [];
      const spotNode = locPath.length > 0 ? locPath[locPath.length - 1] : null;
      const countryNode = locPath.find((n) => n.type === "country" || n.type === "sub-region");
      const regionNode = locPath.find((n) => n.type === "region" || n.type === "island");

      // Extract latitude & longitude
      let lat: number | null = alb.lat ?? spotNode?.lat ?? regionNode?.lat ?? countryNode?.lat ?? null;
      let lng: number | null = alb.lng ?? spotNode?.lng ?? regionNode?.lng ?? countryNode?.lng ?? null;

      // Fallback to photo EXIF GPS if album lacks coordinates
      if ((lat == null || lng == null) && alb.photos && alb.photos.length > 0) {
        for (const p of alb.photos) {
          if (p.exif?.gps?.latitude != null && p.exif?.gps?.longitude != null) {
            lat = p.exif.gps.latitude;
            lng = p.exif.gps.longitude;
            break;
          }
        }
      }

      if (lat != null && lng != null) {
        validGpsList.push({ lat, lng });
      }

      const coverPhoto = alb.photos?.find((p) => p.url === alb.cover_image_url) || alb.photos?.[0];
      const palette =
        alb.cover_color_palette && alb.cover_color_palette.length > 0
          ? alb.cover_color_palette
          : coverPhoto?.color_palette && coverPhoto.color_palette.length > 0
          ? coverPhoto.color_palette
          : ["#6184D8", "#1f2937", "#9ca3af"];

      const accentColor = selectBestAccentColor(palette, "#6184D8", alb.custom_hero_color);

      const spotName = spotNode ? spotNode.name : alb.location || alb.title;
      const countryName = countryNode ? countryNode.name : alb.country_code || "Expedition";
      const countryCode = alb.country_code || countryNode?.iso_code || "EX";

      return {
        alb,
        index,
        lat,
        lng,
        hasGps: lat != null && lng != null,
        spotName,
        regionName: regionNode ? regionNode.name : alb.location || countryName,
        countryName,
        countryCode,
        coverPhotoUrl: alb.cover_image_url || coverPhoto?.url || coverPhoto?.thumbnail_url || null,
        palette,
        accentColor,
        photoCount: alb.photos?.length || 0,
      };
    });

    // Step B: Compute dynamic centroid (mean latitude & longitude of real user data)
    let cLat = 0;
    let cLng = 0;
    if (validGpsList.length > 0) {
      cLat = validGpsList.reduce((sum, p) => sum + p.lat, 0) / validGpsList.length;
      cLng = validGpsList.reduce((sum, p) => sum + p.lng, 0) / validGpsList.length;
    }

    // Step C: Calculate real bearing and distance relative to centroid
    let maxDist = 500;

    const list: RealRadarWaypoint[] = rawParsed.map((item) => {
      let bearing = 0;
      let distanceKm = 100;

      if (item.lat != null && item.lng != null && validGpsList.length > 0) {
        const calc = calculateBearingAndDistance(item.lat, item.lng, cLat, cLng);
        bearing = calc.bearing;
        distanceKm = calc.distanceKm;
        if (distanceKm > maxDist) maxDist = distanceKm;
      } else {
        // Deterministic radial distribution for albums with coordinates pending
        bearing = (item.index * (360 / Math.max(rawParsed.length, 1))) % 360;
        distanceKm = 400 + (item.index % 3) * 250;
      }

      return {
        id: item.alb.id,
        name: item.alb.title,
        region: item.regionName,
        country: item.countryName,
        countryCode: item.countryCode,
        coords: formatCoords(item.lat, item.lng),
        lat: item.lat,
        lng: item.lng,
        hasGps: item.hasGps,
        bearing,
        distanceKm: Math.max(50, distanceKm),
        photoUrl: item.coverPhotoUrl,
        albumSlug: item.alb.slug || item.alb.id,
        palette: item.palette.slice(0, 4),
        accentColor: item.accentColor,
        photoCount: item.photoCount,
      };
    });

    return {
      waypoints: list,
      centroidLat: cLat,
      centroidLng: cLng,
      maxRealDistance: Math.max(maxDist, 1000),
    };
  }, [albums]);

  const [activeWaypointId, setActiveWaypointId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [sweepAngle, setSweepAngle] = useState<number>(0);
  const [zoomMultiplier, setZoomMultiplier] = useState<number>(1);
  const [mouseBearing, setMouseBearing] = useState<number | null>(null);
  const [mouseRange, setMouseRange] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const radarDiskRef = useRef<HTMLDivElement>(null);

  // Set default active waypoint
  useEffect(() => {
    if (waypoints.length > 0 && !activeWaypointId) {
      setActiveWaypointId(waypoints[0].id);
    }
  }, [waypoints, activeWaypointId]);

  // Check prefers-reduced-motion to pause sweep by default if requested
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsScanning(false);
    }
  }, []);

  const activeWaypoint = waypoints.find((w) => w.id === activeWaypointId) || waypoints[0] || null;

  // Continuous 360° Radar Sweep RAF Loop
  useEffect(() => {
    if (!isScanning) return;
    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setSweepAngle((prev) => (prev + dt * 36) % 360);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isScanning]);

  // Scaled radar range
  const maxRangeKm = Math.round(maxRealDistance * zoomMultiplier * 1.15);

  // Cartesian coordinate projection onto the radar disc (50%, 50% origin)
  // Ensures minimum radius of 14% so blips never get covered by center datum hub
  const getWaypointCoordinates = useCallback(
    (wp: RealRadarWaypoint) => {
      const clampedDist = Math.min(wp.distanceKm, maxRangeKm);
      const normalizedRatio = clampedDist / maxRangeKm;
      const radiusPercent = 14 + normalizedRatio * 29;
      const angleRad = ((wp.bearing - 90) * Math.PI) / 180; // 0° is North (top)
      const x = 50 + radiusPercent * Math.cos(angleRad);
      const y = 50 + radiusPercent * Math.sin(angleRad);
      return { x, y, radiusPercent };
    },
    [maxRangeKm]
  );

  // Check if sweep beam is currently scanning over this waypoint
  const isBeamOverWaypoint = useCallback(
    (wpBearing: number) => {
      if (!isScanning) return false;
      const diff = Math.abs(((sweepAngle - wpBearing + 180) % 360) - 180);
      return diff < 16;
    },
    [isScanning, sweepAngle]
  );

  const activeCoord = activeWaypoint ? getWaypointCoordinates(activeWaypoint) : null;

  // Interactive mouse tracking with strict boundary clamping
  const handleRadarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!radarDiskRef.current) return;
    const rect = radarDiskRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const maxRadiusPx = rect.width / 2;

    // If mouse is outside the circular radar boundary, clear telemetry
    if (distPx > maxRadiusPx) {
      setMouseBearing(null);
      setMouseRange(null);
      return;
    }

    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    const estimatedKm = Math.round((distPx / maxRadiusPx) * maxRangeKm);
    setMouseBearing(Math.round(deg));
    setMouseRange(Math.min(estimatedKm, maxRangeKm));
  };

  const handleRadarMouseLeave = () => {
    setMouseBearing(null);
    setMouseRange(null);
  };

  // Scroll to the album position on page when clicked
  const handleWaypointClick = (wp: RealRadarWaypoint) => {
    setActiveWaypointId(wp.id);

    if (typeof window === "undefined") return;

    const targetEl =
      document.getElementById(`album-${wp.albumSlug}`) ||
      document.getElementById(`album-${wp.id}`);

    if (targetEl) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(targetEl, { offset: -60, duration: 1.4 });
      } else {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      const collectionsSection = document.getElementById("featured-collections");
      if (collectionsSection) {
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(collectionsSection, { offset: -40, duration: 1.2 });
        } else {
          collectionsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  };

  // If no published albums in database
  if (waypoints.length === 0) {
    return (
      <div className="relative w-full max-w-xl mx-auto flex flex-col items-center justify-center p-8 border border-foreground/15 rounded-3xl bg-background/80 shadow-lg text-center space-y-4">
        <Compass className="w-10 h-10 text-primary animate-pulse" />
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-bold text-foreground">Spatial Radar Active</h3>
          <p className="text-xs font-mono text-foreground/60 uppercase tracking-widest">
            Awaiting Published Database Expeditions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Expedition Spatial Radar Telemetry"
      className="relative w-full max-w-xl mx-auto flex flex-col items-center select-none py-2 space-y-4 focus:outline-none"
    >
      {/* 1. Primary Darkroom Radar Instrument Housing */}
      <div
        ref={radarDiskRef}
        onMouseMove={handleRadarMouseMove}
        onMouseLeave={handleRadarMouseLeave}
        className="relative w-[340px] h-[340px] sm:w-[410px] sm:h-[410px] md:w-[450px] md:h-[450px] rounded-full border border-foreground/20 bg-background/95 shadow-2xl backdrop-blur-2xl flex items-center justify-center overflow-hidden transition-all duration-500 group"
      >
        {/* Ambient Phosphor Glow matching active album's extracted color */}
        <div
          className="absolute inset-0 rounded-full opacity-25 pointer-events-none transition-colors duration-700"
          style={{
            background: `radial-gradient(circle at center, ${activeWaypoint?.accentColor || "var(--primary)"} 0%, transparent 70%)`,
          }}
        />

        {/* Concentric Polar Range Rings */}
        <div className="absolute w-[28%] h-[28%] rounded-full border border-foreground/15 border-dashed pointer-events-none" />
        <div className="absolute w-[56%] h-[56%] rounded-full border border-foreground/15 pointer-events-none">
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-foreground/50 tracking-wider">
            {Math.round(maxRangeKm * 0.5)} KM
          </span>
        </div>

        {/* Orthographic Hairline Crosshairs (LAT / LON Grid Axes) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-foreground/10" />
          <div className="absolute h-full w-px bg-foreground/10" />
          <div className="absolute w-full h-px bg-foreground/[0.04] rotate-45" />
          <div className="absolute w-full h-px bg-foreground/[0.04] -rotate-45" />
        </div>

        {/* Topographic Contour Iso-Elevation Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
          viewBox="0 0 450 450"
          fill="none"
          stroke="currentColor"
        >
          <path d="M 60,225 Q 130,140 225,180 T 390,160" strokeWidth="0.75" strokeDasharray="3 3" />
          <path d="M 80,280 Q 160,210 250,260 T 400,240" strokeWidth="0.75" />
          <path d="M 50,170 Q 130,90 225,120 T 380,100" strokeWidth="0.75" strokeDasharray="4 2" />
          <path d="M 100,350 Q 180,300 270,340 T 370,310" strokeWidth="0.75" />
        </svg>

        {/* 360° Compass Azimuth Milled Bezel, Degree Ticks & Integrated Clean Cardinal Badges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 450 450">
          {/* Compass Bezel Ticks */}
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = i * 5;
            const isCardinal = angle % 90 === 0;
            const isMajor = angle % 30 === 0;
            const rad = ((angle - 90) * Math.PI) / 180;
            const rOuter = 221;
            // Shorter cardinal ticks to avoid badge collisions
            const rInner = isCardinal ? 215 : isMajor ? 210 : 215;
            const x1 = 225 + rOuter * Math.cos(rad);
            const y1 = 225 + rOuter * Math.sin(rad);
            const x2 = 225 + rInner * Math.cos(rad);
            const y2 = 225 + rInner * Math.sin(rad);

            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={isCardinal ? 1.5 : isMajor ? 1 : 0.5}
                className={isCardinal ? "text-primary" : isMajor ? "text-foreground/60" : "text-foreground/30"}
              />
            );
          })}

          {/* Integrated North Cardinal Badge (000° N) */}
          <g transform="translate(225, 23)">
            <rect
              x="-24"
              y="-8"
              width="48"
              height="16"
              rx="4"
              fill="var(--background)"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-foreground/20"
            />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="bold"
              fill="var(--primary)"
              letterSpacing="0.8"
            >
              000° N
            </text>
          </g>

          {/* Integrated East Cardinal Badge (090° E) */}
          <g transform="translate(424, 225)">
            <rect
              x="-23"
              y="-8"
              width="46"
              height="16"
              rx="4"
              fill="var(--background)"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-foreground/20"
            />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="bold"
              className="fill-foreground/80"
              letterSpacing="0.8"
            >
              090° E
            </text>
          </g>

          {/* Integrated South Cardinal Badge (180° S) */}
          <g transform="translate(225, 427)">
            <rect
              x="-24"
              y="-8"
              width="48"
              height="16"
              rx="4"
              fill="var(--background)"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-foreground/20"
            />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="bold"
              className="fill-foreground/80"
              letterSpacing="0.8"
            >
              180° S
            </text>
          </g>

          {/* Integrated West Cardinal Badge (270° W) */}
          <g transform="translate(26, 225)">
            <rect
              x="-23"
              y="-8"
              width="46"
              height="16"
              rx="4"
              fill="var(--background)"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-foreground/20"
            />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="bold"
              className="fill-foreground/80"
              letterSpacing="0.8"
            >
              270° W
            </text>
          </g>
        </svg>

        {/* 2. Rotating Radar Sweep Beam */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `rotate(${sweepAngle}deg)`,
            transformOrigin: "center center",
          }}
        >
          {/* Conic Phosphor Afterglow Trail */}
          <div
            className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left pointer-events-none opacity-30"
            style={{
              background: `conic-gradient(from 0deg at 0% 100%, ${activeWaypoint?.accentColor || "var(--primary)"} 0deg, transparent 70deg)`,
            }}
          />
          {/* Sharp Sweep Vector Leading Line */}
          <div
            className="absolute top-0 right-1/2 w-[1.5px] h-1/2"
            style={{
              background: `linear-gradient(to top, ${activeWaypoint?.accentColor || "var(--primary)"}, transparent)`,
            }}
          />
        </div>

        {/* 3. Dynamic Center Centroid Hub */}
        <div className="absolute w-7 h-7 rounded-full border border-foreground/30 bg-background/90 shadow-md flex items-center justify-center z-20 pointer-events-none">
          <div
            className="w-2 h-2 rounded-full transition-colors duration-500"
            style={{ backgroundColor: activeWaypoint?.accentColor || "var(--primary)" }}
          />
          <div className="absolute -bottom-4 text-[7px] font-mono uppercase tracking-widest text-foreground/50 whitespace-nowrap">
            {centroidLat !== 0
              ? `${centroidLat.toFixed(1)}°N ${Math.abs(centroidLng).toFixed(1)}°W`
              : "EXPEDITION HUB"}
          </div>
        </div>

        {/* 4. Active Target Vector Line */}
        {activeCoord && activeWaypoint && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <line
              x1="50%"
              y1="50%"
              x2={`${activeCoord.x}%`}
              y2={`${activeCoord.y}%`}
              stroke={activeWaypoint.accentColor}
              strokeWidth="1.2"
              strokeDasharray="4 3"
              opacity="0.8"
            />
          </svg>
        )}

        {/* 5. Real Waypoint Nodes with Overflow-Safe Label Anchor Geometry */}
        {waypoints.map((wp) => {
          const isSelected = activeWaypoint?.id === wp.id;
          const isSwept = isBeamOverWaypoint(wp.bearing);
          const coord = getWaypointCoordinates(wp);

          // Smart label placement: flips horizontally and vertically to prevent clipping inside the circle
          const isRightHalf = coord.x > 58;
          const isBottomHalf = coord.y > 68;

          return (
            <button
              key={wp.id}
              onClick={() => handleWaypointClick(wp)}
              onMouseEnter={() => setActiveWaypointId(wp.id)}
              style={{
                left: `${coord.x}%`,
                top: `${coord.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 group cursor-pointer p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
              aria-label={`Jump to collection: ${wp.name}`}
              title={`Click to scroll to ${wp.name}`}
            >
              <div className="relative flex items-center justify-center">
                {/* Phosphor Ping Echo Ripple on Sweep Over */}
                {isSwept && (
                  <span
                    className="absolute w-8 h-8 rounded-full animate-ping pointer-events-none opacity-80"
                    style={{ backgroundColor: wp.accentColor }}
                  />
                )}

                {/* Target Lock Reticle Brackets on Active Selection */}
                {isSelected && (
                  <motion.div
                    layoutId="radarTargetBracketReal"
                    className="absolute -inset-2 pointer-events-none"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div
                      className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2"
                      style={{ borderColor: wp.accentColor }}
                    />
                    <div
                      className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2"
                      style={{ borderColor: wp.accentColor }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2"
                      style={{ borderColor: wp.accentColor }}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2"
                      style={{ borderColor: wp.accentColor }}
                    />
                  </motion.div>
                )}

                {/* Core Blip Dot */}
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? "scale-125 shadow-[0_0_14px_rgba(97,132,216,0.9)]"
                      : "scale-100 group-hover:scale-115"
                  }`}
                  style={{
                    backgroundColor: isSelected ? wp.accentColor : "var(--background)",
                    borderColor: wp.accentColor,
                  }}
                >
                  <div
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? "bg-white" : "bg-foreground/70"
                    }`}
                  />
                </div>

                {/* Overflow-Safe Dynamic Label */}
                <div
                  className={`absolute ${
                    isRightHalf ? "right-5 text-right" : "left-5 text-left"
                  } ${
                    isBottomHalf ? "bottom-1" : "top-1/2 -translate-y-1/2"
                  } text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded transition-all whitespace-nowrap shadow-sm pointer-events-none ${
                    isSelected
                      ? "bg-background/95 text-foreground border border-foreground/20 font-semibold opacity-100 scale-100 z-40"
                      : "opacity-60 group-hover:opacity-100 bg-background/80 text-foreground/70 border border-foreground/10 hidden sm:block"
                  }`}
                >
                  <span>{wp.name}</span>
                  <span className="text-foreground/40 ml-1">· {wp.countryCode}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
