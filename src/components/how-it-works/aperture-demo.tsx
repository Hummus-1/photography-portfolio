"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Aperture, Sun, Moon } from "lucide-react";

export function ApertureDemo() {
  const [fStop, setFStop] = useState<"f1.4" | "f22">("f1.4");

  const isLight = fStop === "f1.4";

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-foreground/15 bg-foreground/[0.015] space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-film-amber font-semibold">
            <Aperture className="h-4 w-4" />
            <span>Interactive Optics Engine</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
            Aperture Ring Morphing Theme Switcher
          </h3>
        </div>

        {/* F-Stop Control Toggle Buttons (Matching UI 2-state toggle) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-foreground/15 bg-background font-mono text-xs">
          <button
            onClick={() => setFStop("f1.4")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              isLight
                ? "bg-film-amber text-white font-bold shadow"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            <span>F/1.4 (Light Mode)</span>
          </button>

          <button
            onClick={() => setFStop("f22")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              !isLight
                ? "bg-film-amber text-white font-bold shadow"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            <span>F/22 (Dark Mode)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive Lens Aperture SVG Diagram (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl border border-foreground/10 bg-background relative overflow-hidden">
          <div className="relative size-48 sm:size-56 flex items-center justify-center">
            {/* Outer Lens Barrel Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-foreground/30 border-dashed animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-foreground/20" />

            {/* Morphing Blades Container */}
            <motion.div
              animate={{ rotate: isLight ? 0 : 45 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="relative size-36 sm:size-40 flex items-center justify-center"
            >
              {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
                <motion.div
                  key={idx}
                  animate={{ scale: isLight ? 1.0 : 0.45 }}
                  transition={{ type: "spring", stiffness: 140, damping: 18 }}
                  style={{ transformOrigin: "center center" }}
                  className="absolute"
                >
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 60 60"
                    className="text-foreground/80 fill-current"
                    style={{ transform: `rotate(${angle}deg) translate(20px, 0)` }}
                  >
                    <path d="M0 0 L40 10 L30 50 Z" opacity="0.85" />
                  </svg>
                </motion.div>
              ))}
            </motion.div>

            {/* Central Iris Light Beam */}
            <div className="absolute size-8 rounded-full bg-film-amber/20 border border-film-amber blur-xs flex items-center justify-center" />
          </div>

          <div className="mt-4 font-mono text-xs text-foreground/60 uppercase tracking-widest text-center">
            Lens Iris State: <span className="text-film-amber font-bold">{fStop.toUpperCase()}</span>
          </div>
        </div>

        {/* Right Column: Optics Explanation (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-widest text-film-amber font-semibold">
              Photographic Metaphor in Code
            </div>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              {isLight ? "F/1.4 Wide Aperture — Maximum Light Intake" : "F/22 Pin-Hole Aperture — High Contrast Shadow Density"}
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-foreground/80 font-sans leading-relaxed">
            Rather than using a generic theme toggle button, the site&apos;s header implements an interactive camera aperture lens ring. Toggling between Light and Dark modes triggers a smooth 45-degree rotation and scale interpolation of SVG iris blades, mirroring physical camera optics.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs pt-2">
            <div className={`p-3.5 rounded-xl border transition-all ${isLight ? "border-film-amber bg-film-amber/10" : "border-foreground/10 bg-foreground/[0.02]"}`}>
              <div className="text-[10px] text-film-amber font-semibold uppercase tracking-widest">
                F/1.4 Light Mode
              </div>
              <div className="text-foreground/80 mt-1">
                Wide open iris aperture, maximum luminance, subtle shadow depth.
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border transition-all ${!isLight ? "border-film-amber bg-film-amber/10" : "border-foreground/10 bg-foreground/[0.02]"}`}>
              <div className="text-[10px] text-film-amber font-semibold uppercase tracking-widest">
                F/22 Dark Mode
              </div>
              <div className="text-foreground/80 mt-1">
                Small pin-point aperture stop, deep chiaroscuro black values.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
