"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass } from "lucide-react";
import { Album, Photo } from "@/lib/types";
import { selectBestAccentColor } from "@/lib/color-utils";

export interface ExpeditionRadarHeroProps {
  albums?: (Album & { photos?: Photo[] })[];
}

export interface SimulatedRadarWaypoint {
  id: string;
  name: string;
  region: string;
  country: string;
  countryCode: string;
  bearing: number; // degrees 0-360
  radiusPercent: number; // distance percentage from center (20% - 41%)
  x: number; // percentage X on radar
  y: number; // percentage Y on radar
  albumSlug: string;
  accentColor: string;
}

// Alternating radial depth pattern guaranteeing staggered distribution across range rings
const RADIUS_PATTERN = [24, 38, 20, 35, 27, 41];

export function ExpeditionRadarHero({ albums = [] }: ExpeditionRadarHeroProps) {
  // 1. Generate collision-free simulated radial distribution for published database albums
  const waypoints: SimulatedRadarWaypoint[] = useMemo(() => {
    if (!albums || albums.length === 0) return [];

    const total = albums.length;
    // Step angle evenly distributed around 360° with a starting offset
    const angleStep = 360 / total;

    return albums.map((alb, index) => {
      // Distinct angle for each album guaranteeing angular separation
      const angle = (index * angleStep + 38) % 360;
      // Staggered radius from pattern
      const radiusPercent = RADIUS_PATTERN[index % RADIUS_PATTERN.length];

      // Cartesian coordinates on the radar disk (origin 50%, 50%)
      const angleRad = ((angle - 90) * Math.PI) / 180; // 0° is North (top)
      const x = 50 + radiusPercent * Math.cos(angleRad);
      const y = 50 + radiusPercent * Math.sin(angleRad);

      const locPath = alb.location_path || [];
      const countryNode = locPath.find((n) => n.type === "country" || n.type === "sub-region");
      const regionNode = locPath.find((n) => n.type === "region" || n.type === "island");

      const coverPhoto = alb.photos?.find((p) => p.url === alb.cover_image_url) || alb.photos?.[0];
      const palette =
        alb.cover_color_palette && alb.cover_color_palette.length > 0
          ? alb.cover_color_palette
          : coverPhoto?.color_palette && coverPhoto.color_palette.length > 0
          ? coverPhoto.color_palette
          : ["#6184D8", "#1f2937", "#9ca3af"];

      const accentColor = selectBestAccentColor(palette, "#6184D8", alb.custom_hero_color);
      const countryName = countryNode ? countryNode.name : alb.country_code || "Expedition";
      const countryCode = alb.country_code || countryNode?.iso_code || "EX";

      return {
        id: alb.id,
        name: alb.title,
        region: regionNode ? regionNode.name : alb.location || countryName,
        country: countryName,
        countryCode,
        bearing: Math.round(angle),
        radiusPercent,
        x,
        y,
        albumSlug: alb.slug || alb.id,
        accentColor,
      };
    });
  }, [albums]);

  const [activeWaypointId, setActiveWaypointId] = useState<string | null>(null);
  const [sweepAngle, setSweepAngle] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const radarDiskRef = useRef<HTMLDivElement>(null);

  const activeWaypoint = waypoints.find((w) => w.id === activeWaypointId) || null;
  const currentColor = activeWaypoint?.accentColor || "var(--primary)";

  // Continuous 360° Radar Sweep RAF Loop
  useEffect(() => {
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
  }, []);

  // Check if sweep beam is currently scanning over this waypoint
  const isBeamOverWaypoint = useCallback(
    (wpBearing: number) => {
      const diff = Math.abs(((sweepAngle - wpBearing + 180) % 360) - 180);
      return diff < 16;
    },
    [sweepAngle]
  );

  // Scroll to the album position on page when clicked
  const handleWaypointClick = (wp: SimulatedRadarWaypoint) => {
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
      className="relative w-full max-w-xl mx-auto flex flex-col items-center select-none py-2 focus:outline-none"
    >
      {/* Primary Darkroom Radar Instrument Housing */}
      <div
        ref={radarDiskRef}
        className="relative w-[340px] h-[340px] sm:w-[410px] sm:h-[410px] md:w-[450px] md:h-[450px] rounded-full border border-foreground/20 bg-background/95 shadow-2xl backdrop-blur-2xl flex items-center justify-center overflow-hidden transition-all duration-500 group"
      >
        {/* Ambient Phosphor Glow matching active album's extracted color or primary */}
        <div
          className="absolute inset-0 rounded-full opacity-25 pointer-events-none transition-colors duration-700"
          style={{
            background: `radial-gradient(circle at center, ${currentColor} 0%, transparent 70%)`,
          }}
        />x

        {/* Concentric Polar Range Rings (Clean, without scale text) */}
        <div className="absolute w-[28%] h-[28%] rounded-full border border-foreground/15 border-dashed pointer-events-none" />
        <div className="absolute w-[56%] h-[56%] rounded-full border border-foreground/15 pointer-events-none" />

        {/* Orthographic Hairline Crosshairs (LAT / LON Grid Axes) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-foreground/10" />
          <div className="absolute h-full w-px bg-foreground/10" />
          <div className="absolute w-full h-px bg-foreground/[0.04] rotate-45" />
          <div className="absolute w-full h-px bg-foreground/[0.04] -rotate-45" />
        </div>

        {/* Topographic Contour Wavy Elevation Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-25 pointer-events-none text-foreground"
          viewBox="0 0 450 450"
          fill="none"
          stroke="currentColor"
        >
          <path d="M 60,225 Q 130,140 225,180 T 390,160" strokeWidth="0.85" strokeDasharray="4 3" />
          <path d="M 80,280 Q 160,210 250,260 T 400,240" strokeWidth="0.85" />
          <path d="M 50,170 Q 130,90 225,120 T 380,100" strokeWidth="0.85" strokeDasharray="5 3" />
          <path d="M 100,350 Q 180,300 270,340 T 370,310" strokeWidth="0.85" />
        </svg>

        {/* 360° Compass Azimuth Milled Bezel & Cardinal Badges in Main Color */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 450 450">
          {/* Compass Bezel Ticks */}
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = i * 5;
            const isCardinal = angle % 90 === 0;
            const isMajor = angle % 30 === 0;
            const rad = ((angle - 90) * Math.PI) / 180;
            const rOuter = 221;
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

          {/* North Cardinal Badge (000° N) */}
          <g transform="translate(225, 23)">
            <rect
              x="-24"
              y="-8"
              width="48"
              height="16"
              rx="4"
              fill="var(--background)"
              stroke="var(--primary)"
              strokeWidth="0.9"
              strokeOpacity="0.45"
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

          {/* East Cardinal Badge (090° E) */}
          <g transform="translate(424, 225)">
            <rect
              x="-23"
              y="-8"
              width="46"
              height="16"
              rx="4"
              fill="var(--background)"
              stroke="var(--primary)"
              strokeWidth="0.9"
              strokeOpacity="0.45"
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
              090° E
            </text>
          </g>

          {/* South Cardinal Badge (180° S) */}
          <g transform="translate(225, 427)">
            <rect
              x="-24"
              y="-8"
              width="48"
              height="16"
              rx="4"
              fill="var(--background)"
              stroke="var(--primary)"
              strokeWidth="0.9"
              strokeOpacity="0.45"
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
              180° S
            </text>
          </g>

          {/* West Cardinal Badge (270° W) */}
          <g transform="translate(26, 225)">
            <rect
              x="-23"
              y="-8"
              width="46"
              height="16"
              rx="4"
              fill="var(--background)"
              stroke="var(--primary)"
              strokeWidth="0.9"
              strokeOpacity="0.45"
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
              270° W
            </text>
          </g>
        </svg>

        {/* Rotating Radar Sweep Beam */}
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

        {/* Dynamic Center Hub */}
        <div className="absolute w-7 h-7 rounded-full border border-foreground/30 bg-background/90 shadow-md flex items-center justify-center z-20 pointer-events-none">
          <div
            className="w-2 h-2 rounded-full transition-colors duration-500"
            style={{ backgroundColor: activeWaypoint?.accentColor || "var(--primary)" }}
          />
        </div>

        {/* Active Target Vector Line */}
        {activeWaypoint && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <line
              x1="50%"
              y1="50%"
              x2={`${activeWaypoint.x}%`}
              y2={`${activeWaypoint.y}%`}
              stroke={activeWaypoint.accentColor}
              strokeWidth="1.2"
              strokeDasharray="4 3"
              opacity="0.8"
            />
          </svg>
        )}

        {/* Separated Collision-Free Waypoint Nodes */}
        {waypoints.map((wp) => {
          const isSelected = activeWaypoint?.id === wp.id;
          const isSwept = isBeamOverWaypoint(wp.bearing);

          // Smart label placement: flips horizontally and vertically to prevent clipping
          const isRightHalf = wp.x > 54;
          const isBottomHalf = wp.y > 65;

          return (
            <button
              key={wp.id}
              onClick={() => handleWaypointClick(wp)}
              onMouseEnter={() => setActiveWaypointId(wp.id)}
              style={{
                left: `${wp.x}%`,
                top: `${wp.y}%`,
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
                    layoutId="radarTargetBracketSim"
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

                {/* ONLY show the title of the selected album */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: isBottomHalf ? 6 : -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute ${
                        isRightHalf ? "right-6 text-right" : "left-6 text-left"
                      } ${
                        isBottomHalf ? "bottom-0" : "top-1/2 -translate-y-1/2"
                      } text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-background/95 text-foreground border border-foreground/20 font-semibold shadow-lg z-40 whitespace-nowrap pointer-events-none flex items-center gap-1.5`}
                      style={{
                        borderColor: `${wp.accentColor}70`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: wp.accentColor }}
                      />
                      <span>{wp.name}</span>
                      <span className="text-foreground/40 font-normal">· {wp.countryCode}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
