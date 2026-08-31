"use client";

import { motion } from "framer-motion";
import { Aperture, Compass, Camera, Sparkles } from "lucide-react";

export function CuratorialManifesto() {
  return (
    <section className="w-full py-24 md:py-32 border-b border-foreground/10 bg-foreground/[0.01] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-16">
        
        {/* Section Header with Left-Margin Numbered Label */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-baseline border-b border-foreground/10 pb-8">
          <div className="md:col-span-3 flex items-center gap-3 text-xs font-mono tracking-widest uppercase text-foreground/50">
            <span className="text-primary font-bold flex items-center gap-1">
              04
            </span>
            <span className="w-6 h-px bg-foreground/20" />
            <span>Artist Statement</span>
          </div>

          <div className="md:col-span-9 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Notes on Light, Form & Remote Terrain
            </h2>
            <p className="text-base sm:text-lg font-sans text-foreground/70 leading-relaxed max-w-3xl">
              Photography, for me, is a practice of quiet observation. It is an exploration of high-altitude solitude, coastal atmospheric shifts, and structural geometries carved by elements over centuries.
            </p>
          </div>
        </div>

        {/* 3 Pillars of Personal Photographic Practice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pt-4">
          
          {/* Pillar 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="pt-8 border-t border-foreground/15 space-y-4 hover:border-primary transition-colors group"
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-primary font-semibold">
              <span>GEOGRAPHY</span>
              <Compass className="h-4 w-4 text-foreground/40 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              Volcanic & Sub-Arctic Expeditions
            </h3>
            <p className="text-sm font-sans text-foreground/70 leading-relaxed">
              Seeking out isolated landscapes—from basalt sea stacks in Tenerife to glacial fjords in Norway—where geological time is tangible and weather shapes the horizon.
            </p>
          </motion.div>

          {/* Pillar 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="pt-8 border-t border-foreground/15 space-y-4 hover:border-primary transition-colors group"
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-primary font-semibold">
              <span>ATMOSPHERE</span>
              <Camera className="h-4 w-4 text-foreground/40 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              Chiaroscuro & Filmic Tones
            </h3>
            <p className="text-sm font-sans text-foreground/70 leading-relaxed">
              Emphasizing natural directional light, deep shadow values, and muted tonal palettes to capture the mood and stillness of each location.
            </p>
          </motion.div>

          {/* Pillar 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-8 border-t border-foreground/15 space-y-4 hover:border-primary transition-colors group"
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-primary font-semibold">
              <span>GEOMETRY</span>
              <Sparkles className="h-4 w-4 text-foreground/40 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              Architectural Form
            </h3>
            <p className="text-sm font-sans text-foreground/70 leading-relaxed">
              Studying structural lines, negative space, and modern minimal forms in urban spaces that echo the clean lines of raw natural landscapes.
            </p>
          </motion.div>

        </div>

        {/* Bottom Colophon Quote */}
        <div className="pt-8 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-foreground/60 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Aperture className="h-3.5 w-3.5 text-primary" />
            <span>Daniel García • Personal Photography Portfolio</span>
          </div>
          <div className="text-[11px] text-foreground/50">
            All stills captured on location
          </div>
        </div>

      </div>
    </section>
  );
}
