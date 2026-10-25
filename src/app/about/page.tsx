"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import Image from "next/image";
import {
  Camera,
  MapPin,
  Mail,
  Globe,
  ArrowUpRight,
  Check,
  Copy,
  Compass,
  Film,
  Aperture,
  Sliders,
} from "lucide-react";

export default function AboutPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText("dani@danigh.dev");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-400 selection:bg-primary selection:text-white">
      {/* Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-grow w-full py-8 sm:py-12 md:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
          
          {/* Eyebrow Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/10 pb-6 text-xs font-mono tracking-widest uppercase text-foreground/60">
            <div className="flex items-center gap-3">
              <span className="text-primary font-bold flex items-center gap-1.5">
                <Aperture className="h-3.5 w-3.5" />
                01
              </span>
              <span className="w-6 h-px bg-foreground/20" />
              <div className="flex items-center gap-2 text-foreground/80">
                <span>Artist Colophon & Practice</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-foreground/50">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Santa Cruz de Tenerife, Canary Islands, Spain</span>
            </div>
          </div>

          {/* Page Hero Title */}
          <div className="space-y-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>Software Engineer & Visual Creator</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
              Daniel García
              <br />
              <span className="opacity-40 font-normal italic">Notes on Light & Software.</span>
            </h1>
          </div>

          {/* Main Grid: Portrait & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Left Column: Portrait & Connect Cards (5 Cols) */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
              
              {/* Archival Portrait Frame */}
              <div className="relative p-2 rounded-3xl border border-foreground/15 bg-background/80 shadow-2xl backdrop-blur-md group transition-all duration-500 hover:border-primary/60 hover:ring hover:ring-primary/70 hover:ring-offset-background">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-foreground/5">
                  <Image
                    src="/about-portrait.jpg"
                    alt="Daniel García portrait"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
                    quality={90}
                    priority
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </div>

              {/* Quick Connect & Links Box */}
              <div className="p-5 sm:p-6 rounded-2xl border border-foreground/15 bg-foreground/[0.015] space-y-5">
                <div className="text-xs font-mono uppercase tracking-widest text-primary font-semibold flex items-center gap-1.5 border-b border-foreground/10 pb-3">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Direct Contact</span>
                </div>

                <div className="space-y-3">
                  {/* Clickable Email with Copy Button */}
                  <a
                    href="mailto:dani@danigh.dev"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-foreground/10 bg-background/60 hover:border-primary/50 transition-all group"
                  >
                    <div>
                      <div className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">
                        Email Address
                      </div>
                      <div className="text-xs sm:text-sm font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                        dani@danigh.dev
                      </div>
                    </div>

                    <button
                      onClick={handleCopyEmail}
                      title="Copy email to clipboard"
                      className="p-2 rounded-lg bg-foreground/5 hover:bg-primary/20 hover:text-primary transition-all cursor-pointer text-foreground/70"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </a>

                  {/* Engineering Portfolio Link */}
                  <a
                    href="https://www.danigh.dev/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-foreground/10 bg-background/60 hover:border-primary/50 transition-all group"
                  >
                    <div>
                      <div className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">
                        Engineering Portfolio
                      </div>
                      <div className="text-xs sm:text-sm font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                        danigh.dev
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-foreground/40 group-hover:text-primary transition-colors" />
                  </a>
                </div>

                {/* Social Network Links */}
                <div className="pt-2 border-t border-foreground/10 flex flex-wrap items-center gap-2.5 text-xs font-mono uppercase tracking-widest">
                  <a
                    href="https://github.com/Hummus-1"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-foreground/15 hover:border-primary hover:text-primary transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/daniel-garc%C3%ADa-hern%C3%A1ndez-866a99264/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-foreground/15 hover:border-primary hover:text-primary transition-colors"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://www.behance.net/danielgarciaher2"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-foreground/15 hover:border-primary hover:text-primary transition-colors"
                  >
                    Behance
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column: Bio Narrative & Technical Craft (7 Cols) */}
            <div className="lg:col-span-7 space-y-12 sm:space-y-16">
              
              {/* Bio Statement */}
              <div className="space-y-6 text-foreground/80 text-base md:text-lg font-sans leading-relaxed">
                <p className="text-lg sm:text-xl md:text-2xl font-serif text-foreground leading-snug">
                  &ldquo;For me, programming and photography are twin mediums of observation—one translates logic into interactive systems, while the other captures atmospheric stillness and geometric form.&rdquo;
                </p>

                <p>
                  I am a software engineer, visual creator, and photographer based in Santa Cruz de Tenerife, Canary Islands. My work spans designing and building modern software systems while documenting the unique light, volcanic textures, and coastal geometries of remote landscapes.
                </p>

                <p>
                  This visual archive documents my photographic expeditions across volcanic landscapes, ocean headlands, and sub-arctic wilderness—from basalt columns in Tenerife to iceberg-filled fjords in Norway.
                </p>
              </div>

              {/* Practice Pillars */}
              <div className="space-y-6 pt-6 border-t border-foreground/10">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                  <Compass className="h-4 w-4" />
                  <span>Photographic Philosophy & Practice</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  
                  <div className="p-5 sm:p-6 rounded-2xl border border-foreground/15 bg-background/60 hover:border-primary/40 transition-colors space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold">
                      01 • CHIAROSCURO & LIGHT
                    </div>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      Directional Natural Light
                    </h3>
                    <p className="text-xs text-foreground/70 leading-relaxed font-sans">
                      Emphasizing deep shadow values, low sun angles, and muted filmic palettes to convey quiet isolation.
                    </p>
                  </div>

                  <div className="p-5 sm:p-6 rounded-2xl border border-foreground/15 bg-background/60 hover:border-primary/40 transition-colors space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold">
                      02 • GEOLOGY & SCALE
                    </div>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      Remote Expeditions
                    </h3>
                    <p className="text-xs text-foreground/70 leading-relaxed font-sans">
                      Documenting volcanic landforms, coastal sea stacks, and glacial icebergs geotagged with exact coordinates.
                    </p>
                  </div>

                </div>
              </div>

              {/* Equipment & Processing Stack */}
              <div className="space-y-6 pt-6 border-t border-foreground/10">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                  <Sliders className="h-4 w-4" />
                  <span>Field Kit & Technical Craft</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* Primary System & Lenses */}
                  <div className="p-5 sm:p-6 rounded-2xl border border-foreground/15 bg-foreground/[0.015] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-foreground/60 font-semibold border-b border-foreground/10 pb-3">
                      <Camera className="h-4 w-4 text-primary" />
                      <span>Primary System • Fujifilm X</span>
                    </div>
                    <ul className="space-y-2.5 text-xs font-mono text-foreground/80">
                      <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>Primary Body</span>
                        <span className="text-foreground font-semibold">Fujifilm X-T5</span>
                      </li>
                      <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2.5 border-t border-foreground/10">
                        <span>Standard Zoom</span>
                        <span className="text-foreground/70">Sigma 18-50mm f/2.8</span>
                      </li>
                      <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>Ultra-Wide Zoom</span>
                        <span className="text-foreground/70">Sigma 10-18mm f/2.8</span>
                      </li>
                      <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>Telephoto Zoom</span>
                        <span className="text-foreground/70">Fujinon 70-300mm</span>
                      </li>
                    </ul>
                  </div>

                  {/* Secondary Bodies, Drone & Software */}
                  <div className="p-5 sm:p-6 rounded-2xl border border-foreground/15 bg-foreground/[0.015] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-foreground/60 font-semibold border-b border-foreground/10 pb-3">
                      <Film className="h-4 w-4 text-primary" />
                      <span>Secondary, Aerial & Software</span>
                    </div>
                    <ul className="space-y-2.5 text-xs font-mono text-foreground/80">
                      <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>Micro 4/3 Body</span>
                        <span className="text-foreground/70">Olympus E-M10 II</span>
                      </li>
                      <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>Compact APS-C</span>
                        <span className="text-foreground/70">Sony α6000</span>
                      </li>
                      <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>Aerial Drone</span>
                        <span className="text-foreground/70">DJI Mini 3</span>
                      </li>
                      <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2.5 border-t border-foreground/10">
                        <span>RAW Development</span>
                        <span className="text-foreground font-semibold">DxO PhotoLab</span>
                      </li>
                      <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>Film Simulations</span>
                        <span className="text-foreground/70">DxO FilmPack</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>

              {/* Availability & Project Inquiries Banner */}
              <div className="p-5 sm:p-6 rounded-2xl border border-primary/30 bg-primary/5 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-6 shadow-sm">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                      Current Availability Status
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans font-medium text-foreground/90 leading-snug">
                    Open for select landscape expeditions, architecture & web engineering
                  </p>
                </div>

                <a
                  href="mailto:dani@danigh.dev"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-mono text-xs uppercase tracking-widest font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shrink-0 cursor-pointer"
                >
                  <span>Inquire</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 md:px-12 border-t border-foreground/10 bg-background text-xs font-mono uppercase tracking-widest text-foreground/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span>© {new Date().getFullYear()} Daniel García. All Rights Reserved.</span>
            <span className="hidden sm:inline text-foreground/20">•</span>
            <span className="text-[10px] text-foreground/35 normal-case tracking-normal">No AI Training / Text & Data Mining Reserved</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>Santa Cruz de Tenerife</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
