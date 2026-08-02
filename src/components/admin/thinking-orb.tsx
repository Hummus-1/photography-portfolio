"use client";

import React from "react";

export type OrbState = "idle" | "thinking" | "uploading" | "ai-analyzing" | "success" | "error";

interface ThinkingOrbProps {
  state?: OrbState;
  size?: "sm" | "md" | "lg";
  label?: string;
  sublabel?: string;
  className?: string;
}

export function ThinkingOrb({
  state = "idle",
  size = "md",
  label,
  sublabel,
  className = "",
}: ThinkingOrbProps) {
  const sizeMap = {
    sm: { container: "w-4 h-4", core: "w-2 h-2", ring: "w-4 h-4", ring2: "w-6 h-6" },
    md: { container: "w-6 h-6", core: "w-3 h-3", ring: "w-6 h-6", ring2: "w-9 h-9" },
    lg: { container: "w-10 h-10", core: "w-5 h-5", ring: "w-10 h-10", ring2: "w-14 h-14" },
  };

  const stateColors = {
    idle: {
      core: "bg-film-amber shadow-[0_0_12px_rgba(217,107,39,0.7)]",
      ring: "border-film-amber/40 animate-ping-slow",
      ring2: "border-film-amber/15",
    },
    thinking: {
      core: "bg-film-amber shadow-[0_0_16px_rgba(230,126,58,0.8)] animate-pulse",
      ring: "border-film-amber/60 border-t-transparent animate-spin",
      ring2: "border-film-amber/20 border-b-transparent animate-spin-reverse",
    },
    uploading: {
      core: "bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)] animate-bounce",
      ring: "border-emerald-400/50 border-dashed animate-spin",
      ring2: "border-emerald-400/20 animate-pulse",
    },
    "ai-analyzing": {
      core: "bg-indigo-400 shadow-[0_0_18px_rgba(129,140,248,0.9)] animate-pulse",
      ring: "border-indigo-400/60 border-l-transparent animate-spin",
      ring2: "border-purple-400/30 border-r-transparent animate-spin-reverse",
    },
    success: {
      core: "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.7)]",
      ring: "border-emerald-400/40",
      ring2: "border-emerald-400/20",
    },
    error: {
      core: "bg-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.8)] animate-ping-fast",
      ring: "border-rose-500/60",
      ring2: "border-rose-500/20",
    },
  };

  const currentSize = sizeMap[size];
  const currentColor = stateColors[state];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative flex items-center justify-center ${currentSize.container}`}>
        {/* Outer orbital ring */}
        <span
          className={`absolute rounded-full border ${currentSize.ring2} ${currentColor.ring2}`}
        />

        {/* Inner spinning/pulsing ring */}
        <span
          className={`absolute rounded-full border ${currentSize.ring} ${currentColor.ring}`}
        />

        {/* Glowing core dot */}
        <span className={`relative rounded-full transition-all duration-300 ${currentSize.core} ${currentColor.core}`} />
      </div>

      {(label || sublabel) && (
        <div className="flex flex-col leading-tight">
          {label && (
            <span className="font-mono text-xs font-semibold tracking-wider uppercase text-white/90">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="font-mono text-[10px] text-white/50 tracking-widest uppercase">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
