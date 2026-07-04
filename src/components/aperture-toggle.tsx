"use client";

import { useTheme } from "./theme-provider";
import { motion } from "framer-motion";

export function ApertureToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex items-center gap-3 cursor-none focus:outline-none"
      aria-label="Toggle theme"
    >
      {/* Aperture Status F-stop numbers */}
      <div className="h-6 overflow-hidden relative w-12 text-right text-xs font-mono uppercase tracking-widest text-foreground/80">
        <motion.div
          animate={{ y: theme === "light" ? "0%" : "-50%" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex flex-col justify-between"
        >
          <span className="h-6 flex items-center justify-end">F/1.4</span>
          <span className="h-6 flex items-center justify-end font-bold">F/22</span>
        </motion.div>
      </div>

      {/* Camera Lens Aperture Ring SVG */}
      <div className="relative h-9 w-9 rounded-full border border-foreground/30 flex items-center justify-center overflow-hidden">
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground transition-colors duration-300"
          animate={{ rotate: theme === "light" ? 0 : 180 }}
          whileHover={{ rotate: theme === "light" ? 45 : 225 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        >
          {/* Outer Ring */}
          <circle cx="12" cy="12" r="10" />

          {/* Aperture Blades (8-blade setup) */}
          <motion.path
            d="M12 2 L12 6"
            animate={{ d: theme === "light" ? "M12 2 L12 6" : "M12 2 L8 8" }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            d="M22 12 L18 12"
            animate={{ d: theme === "light" ? "M22 12 L18 12" : "M22 12 L16 8" }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            d="M12 22 L12 18"
            animate={{ d: theme === "light" ? "M12 22 L12 18" : "M12 22 L16 16" }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            d="M2 12 L6 12"
            animate={{ d: theme === "light" ? "M2 12 L6 12" : "M2 12 L8 16" }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            d="M5 5 L8 8"
            animate={{ d: theme === "light" ? "M5 5 L8 8" : "M5 5 L4 10" }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            d="M19 5 L16 8"
            animate={{ d: theme === "light" ? "M19 5 L16 8" : "M19 5 L14 4" }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            d="M19 19 L16 16"
            animate={{ d: theme === "light" ? "M19 19 L16 16" : "M19 19 L20 14" }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            d="M5 19 L8 16"
            animate={{ d: theme === "light" ? "M5 19 L8 16" : "M5 19 L10 20" }}
            transition={{ duration: 0.6 }}
          />

          {/* Inner opening circle representing opening of lens */}
          <motion.circle
            cx="12"
            cy="12"
            animate={{ r: theme === "light" ? 6 : 2.5 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            fill="currentColor"
            fillOpacity={theme === "light" ? 0.05 : 0.25}
          />
        </motion.svg>

        {/* Micro-glow effect */}
        <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </button>
  );
}
