"use client";

import { useTheme } from "./theme-provider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ApertureToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme : "dark";
  const isLight = currentTheme === "light";

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isLight ? "dark" : "light";

    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = (document as any).startViewTransition(() => {
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        toggleTheme();
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];
        document.documentElement.animate(
          {
            clipPath: isLight ? clipPath.slice().reverse() : clipPath,
          },
          {
            duration: 400,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: isLight
              ? "::view-transition-old(root)"
              : "::view-transition-new(root)",
          }
        );
      });
    } else {
      toggleTheme();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="group relative flex items-center gap-3 focus:outline-none cursor-pointer select-none"
      aria-label="Toggle theme"
      title={isLight ? "Switch to Dark Mode (F/22)" : "Switch to Light Mode (F/1.4)"}
    >
      {/* Aperture Status F-stop numbers */}
      <div className="h-6 overflow-hidden relative w-12 text-right text-xs font-mono uppercase tracking-widest text-foreground/80">
        <motion.div
          animate={{ y: isLight ? 0 : -24 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 left-0 w-full flex flex-col"
        >
          <span className="h-6 flex items-center justify-end font-medium">F/1.4</span>
          <span className="h-6 flex items-center justify-end font-bold">F/22</span>
        </motion.div>
      </div>

      {/* Camera Lens Aperture Ring SVG */}
      <div className="relative h-9 w-9 rounded-full border border-foreground/25 group-hover:border-foreground/50 transition-colors duration-200 flex items-center justify-center overflow-hidden bg-background/50 backdrop-blur-xs">
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
          animate={{ rotate: isLight ? 0 : 180 }}
          whileHover={{ rotate: isLight ? 30 : 210 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Outer Ring */}
          <circle cx="12" cy="12" r="9.5" strokeWidth="1.2" />

          {/* Aperture Blades (8-blade setup) with smooth transform rotation */}
          <motion.g
            animate={{
              rotate: isLight ? 0 : 45,
              scale: isLight ? 1 : 0.85,
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "12px 12px" }}
          >
            <line x1="12" y1="2.5" x2="12" y2="6.5" />
            <line x1="21.5" y1="12" x2="17.5" y2="12" />
            <line x1="12" y1="21.5" x2="12" y2="17.5" />
            <line x1="2.5" y1="12" x2="6.5" y2="12" />
            <line x1="5.3" y1="5.3" x2="8.1" y2="8.1" />
            <line x1="18.7" y1="5.3" x2="15.9" y2="8.1" />
            <line x1="18.7" y1="18.7" x2="15.9" y2="15.9" />
            <line x1="5.3" y1="18.7" x2="8.1" y2="15.9" />
          </motion.g>

          {/* Inner lens aperture opening */}
          <motion.circle
            cx="12"
            cy="12"
            animate={{
              r: isLight ? 6.5 : 2.5,
              fillOpacity: isLight ? 0.08 : 0.35,
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            fill="currentColor"
          />
        </motion.svg>

        {/* Micro-glow effect */}
        <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    </button>
  );
}


