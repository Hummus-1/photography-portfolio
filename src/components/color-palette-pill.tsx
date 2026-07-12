"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy } from "lucide-react";

interface ColorPalettePillProps {
  colors?: string[];
}

export function ColorPalettePill({ colors }: ColorPalettePillProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isPillHovered, setIsPillHovered] = useState(false);

  if (!colors || colors.length === 0) return null;

  const handleCopy = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 1500);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  // Generate the gradient string
  const gradientString = `linear-gradient(to right, ${colors.join(", ")})`;

  // We limit to 5 colors for a consistent size and layout
  const displayColors = colors.slice(0, 5);
  const numColors = displayColors.length;
  // size-4 (16px) bubbles with gap-1.5 (6px) and ml-1 (4px)
  const bubblesWidth = numColors > 0 ? 22 * numColors - 2 : 0;

  return (
    <div className="relative py-1 select-none z-10">
      <motion.div
        className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-background/40 border border-foreground/10 backdrop-blur-md relative shadow-sm cursor-pointer"
        onMouseEnter={() => setIsPillHovered(true)}
        onMouseLeave={() => {
          setIsPillHovered(false);
          setHoveredIndex(null);
        }}
        layout
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
      >
        {/* Subtle glow effect behind the pill matching the cover colors */}
        <div
          className="absolute inset-0 -z-10 rounded-full blur-md transition-opacity duration-300"
          style={{
            background: gradientString,
            opacity: isPillHovered ? 0.35 : 0.15,
          }}
        />

        {/* Small label */}
        <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-foreground/50 pr-1 border-r border-foreground/10">
          Palette
        </span>

        {/* Sub-container grouping the gradient bar and color bubbles */}
        <div className="flex items-center flex-nowrap shrink-0">
          {/* The gradient bar itself */}
          <motion.div
            className="h-4 rounded-full relative overflow-hidden shrink-0"
            layout
            animate={{ width: isPillHovered ? 36 : 90 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div
              className="absolute inset-0 w-full h-full"
              style={{ background: gradientString }}
            />
          </motion.div>

          {/* Expanding list of color bubbles */}
          <AnimatePresence>
            {isPillHovered && (
              <motion.div
                className="flex items-center gap-1.5 overflow-hidden flex-nowrap shrink-0"
                initial={{ width: 0, marginLeft: 0, opacity: 0 }}
                animate={{ width: bubblesWidth, marginLeft: 12, opacity: 1 }}
                exit={{ width: 0, marginLeft: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {displayColors.map((color, index) => {
                  const isCopied = copiedColor === color;
                  const isColorHovered = hoveredIndex === index;

                  return (
                    <motion.div
                      key={color}
                      className="relative shrink-0"
                      initial={{ scale: 0, x: -10 }}
                      animate={{ scale: 1, x: 0 }}
                      exit={{ scale: 0, x: -10 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        delay: index * 0.04,
                      }}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(color);
                      }}
                    >
                      <motion.button
                        className="size-4 rounded-full border border-foreground/15 shadow-sm relative flex items-center justify-center cursor-copy group/color"
                        style={{ backgroundColor: color }}
                      >
                        <span className="sr-only">Copy {color}</span>
                        {isCopied ? (
                          <Check className="size-2 mix-blend-difference text-white stroke-[3px]" />
                        ) : (
                          <Copy className="size-1.5 opacity-0 group-hover/color:opacity-100 transition-opacity duration-200 mix-blend-difference text-white" />
                        )}
                      </motion.button>

                      {/* Tooltip */}
                      <AnimatePresence>
                        {(isColorHovered || isCopied) && (
                          <motion.div
                            className="absolute bottom-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-mono py-1 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap tracking-wider z-20"
                            initial={{ opacity: 0, y: 5, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.9 }}
                            transition={{ duration: 0.15 }}
                          >
                            {isCopied ? "Copied!" : color.toUpperCase()}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
