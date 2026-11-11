"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import {
  RotateCcw,
  Sparkles,
  Sliders,
  Code2,
  Check,
  Copy,
  ArrowRight,
  Gauge,
  Camera,
  MapPin,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

// Real project sample assets
const SAMPLE_PORTRAIT = {
  src: "/about-portrait.jpg",
  // Real 70-byte micro-WebP
  lqip: "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADQAQCdASoQAAsABUB8JZQCdAEOnyEjgAD+00y3G7Hn+7c8MOqe5oC3l9znO77od8iu8vympGMAAA==",
  midThumb: "data:image/webp;base64,UklGRlgBAABXRUJQVlA4IEwBAAAwCQCdASpQADcAPu1mrVKppKQiqbK7aTAdiWcA0URGGiSW9eln4v2v7k7gSdMo3/uuHcIXVs4S2tkXPNAMtqqWAwBgt8CvvBedCYnHHXSxCfSAAP7v9ryaE3YdunVnCs508y6NA/nWbL2a4jH2OkLEdH55KRkpnX1GftGv61kNB/I9u5wP+Rb4TOsXLAhJ9wQzrvgy1PsVClezRLZw+tnvWBKvUjICsMYoRefHVHtdka5l76vtz99sPHs2l76yPTHZjbz3HBzHozkWgbvBHiYpOSM5Qd2RaYUb60AQHBdCq2HT6dnzeUtrK6MkdvDv13tuISKqc0k36olggYjBon2efSSAM9m2dvuTv1sn3UKCAmQe/xG2rINV9uG0XM7W53BfEp8X468kRBCkp1trzaProWy4C1KH0emk2WXbklAhR+EDkcIIMpTx7MAAAA==",
  aspectRatio: 0.8,
  dominantColor: "#b2bbc7",
};

const SAMPLE_LANDSCAPE = {
  src: "/teide.jpg",
  // Real 65-byte micro-WebP
  lqip: "data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAADQAQCdASoQAAwABUB8JaAC7ADa5IsyGAD7j1n+FlI/CabyjIAhyJBtVgWrpJ+OcqCgAA==",
  midThumb: "data:image/webp;base64,UklGRv4AAABXRUJQVlA4IPIAAADwCACdASpQADwAPu1ipU2ptKupMBzKapAdiWMAwrQrhnUPs5LyYpQQJ0cL/2QQhjmZnr39FgodgZe++MfWGWpfqRJmnj+E57nShVK1W1cugAD+2JoILql2VqgN0gDBnRs3LV4wQoknO1Jdic55DwbDVpvcWZ/9o9vNpyVbZHAOlDun3h3xB0Yz5kE1SxPLEzSoxfE1Ijf846CmySi/hEWD/ACo3UzragOSFcqd2hva01fcEYSOM+E7TZ0w6doxLwpKMaymEjcWEtVrHoNhJAIYFbOLJoeXu//m2DhfsjffqNLLPCWgsyyInL4PcyXmOTN0AA==",
  aspectRatio: 1.6,
  dominantColor: "#82746e",
};

type NetworkSpeed = "fast" | "normal" | "slow";

const NETWORK_DELAYS: Record<NetworkSpeed, number> = {
  fast: 200,
  normal: 950,
  slow: 2400,
};

export default function LoadingLabPage() {
  const [networkSpeed, setNetworkSpeed] = useState<NetworkSpeed>("normal");
  const [isSlowMotion, setIsSlowMotion] = useState(false);
  const [masterCycle, setMasterCycle] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Scenario 2: Toggle between Hero and Home Collections styling
  const [coverContext, setCoverContext] = useState<"hero" | "home">("hero");

  // Scenario 3 (Lightbox) state for photo switching & full-screen modal
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const lightboxPhotos = [SAMPLE_LANDSCAPE, SAMPLE_PORTRAIT];

  // Keyboard navigation when Lightbox modal is open
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i === 0 ? 1 : 0));
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === 0 ? 1 : 0));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  // Lock body scroll when Lightbox modal is open
  useEffect(() => {
    if (isLightboxOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLightboxOpen]);

  const handleReplayAll = () => {
    setMasterCycle((c) => c + 1);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const delayMs = NETWORK_DELAYS[networkSpeed];
  const transitionDuration = isSlowMotion ? 2500 : 700;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary selection:text-white">
      <Navigation />

      <main className="flex-grow w-full py-8 sm:py-12 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-10">
        
        {/* Header Breadcrumb & Title */}
        <div className="space-y-4 border-b border-foreground/10 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-widest uppercase text-foreground/60">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                SHARED COMPONENT LAB
              </span>
              <span>/</span>
              <span>PROGRESSIVEIMAGE IN ALL 4 PORTFOLIO PATTERNS</span>
            </div>
            <Link
              href="/about"
              className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-1 text-[11px]"
            >
              <span>Back to About</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Single Shared &lt;ProgressiveImage /&gt; Component
            </h1>
            <p className="text-sm sm:text-base text-foreground/70 max-w-3xl leading-relaxed">
              Every scenario below imports the exact same shared{" "}
              <code className="text-primary font-mono font-semibold bg-primary/10 px-1.5 py-0.5 rounded">
                ProgressiveImage
              </code>{" "}
              component, powered by <strong>3B (Organic Breathing Pulse)</strong> while downloading.
              Notice that the <strong>Album Hero</strong> and <strong>Home Collections Cover</strong> share
              the exact same visual architecture (16:10 frame, dynamic color ring, glowing bloom, and viewfinder reticles).
            </p>
          </div>
        </div>

        {/* Interactive Control Console */}
        <div className="sticky top-20 z-40 p-4 sm:p-5 rounded-2xl border border-foreground/15 bg-background/90 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Speed & Slow-Mo Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-foreground/5 p-1 rounded-xl border border-foreground/10 text-xs font-mono">
                <span className="px-2 text-[10px] text-foreground/50 uppercase flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  Speed:
                </span>
                {(["fast", "normal", "slow"] as NetworkSpeed[]).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setNetworkSpeed(spd);
                      handleReplayAll();
                    }}
                    className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[11px] transition-all ${
                      networkSpeed === spd
                        ? "bg-foreground/20 text-foreground font-semibold"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {spd === "fast" ? "Fast" : spd === "normal" ? "4G (950ms)" : "Slow 3G"}
                  </button>
                ))}
              </div>

              {/* Curated Collections Zoom Reference Indicator */}
              <div className="flex items-center gap-2 bg-foreground/5 px-3 py-1.5 rounded-xl border border-foreground/10 text-xs font-mono">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-foreground/80">
                  Curated Collections Zoom: <code className="text-primary font-bold">700ms ease-out</code>
                </span>
              </div>

              {/* Slow Motion Toggle */}
              <button
                onClick={() => setIsSlowMotion(!isSlowMotion)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
                  isSlowMotion
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-500 font-semibold"
                    : "border-foreground/10 text-foreground/70 hover:border-foreground/30 hover:bg-foreground/5"
                }`}
                title="Slows down the transition to 2.5s for detailed inspection"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Slow-Mo ({isSlowMotion ? "2.5s" : "0.7s"})</span>
              </button>
            </div>

            {/* Replay All Action */}
            <button
              onClick={handleReplayAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono uppercase tracking-wider font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Replay All 4 Patterns</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* THE 4 PORTFOLIO PATTERNS GRID                             */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* ------------------------------------------------------- */}
          {/* PATTERN 1: ALBUM PHOTO STREAM (PhotoCard)               */}
          {/* ------------------------------------------------------- */}
          <ScenarioCard
            title="1. Gallery Masonry Still"
            subtitle="Used in PhotoCard (Album Stream)"
            badge="Pattern 1"
            description="Used for all photos in an album stream. Employs 3B breathing pulse on R2 thumbnail, bottom gradient scrim on hover, and EXIF camera specs."
            codeSnippet={`<ProgressiveImage
  src={photo.url}
  thumbnailSrc={photo.thumbnail_url}
  alt={photo.location || "Photo"}
  aspectRatio={photo.aspect_ratio}
  variant="breathing"
  gradient="bottom"
  hoverEffect="subtle"
>
  {/* Hover EXIF overlay rendered cleanly as children */}
  <div className="absolute inset-0 opacity-0 group-hover/img:opacity-100 flex flex-col justify-end p-5 text-white transition-opacity">
    <span className="text-xs font-mono">24mm • f/2.8 • 1/500s</span>
  </div>
</ProgressiveImage>`}
            cardId="scen-1"
            copiedId={copiedId}
            onCopyCode={handleCopyCode}
            renderPreview={(key) => (
              <ProgressiveImage
                key={`s1-${key}-${masterCycle}`}
                src={SAMPLE_LANDSCAPE.src}
                thumbnailSrc={SAMPLE_LANDSCAPE.lqip}
                dominantColor={SAMPLE_LANDSCAPE.dominantColor}
                alt="Teide Landscape"
                aspectRatio={SAMPLE_LANDSCAPE.aspectRatio}
                variant="breathing"
                gradient="bottom"
                hoverEffect="subtle"
                simulatedDelayMs={delayMs}
                transitionDuration={transitionDuration}
              >
                {/* Hover EXIF Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover/img:opacity-100 flex flex-col justify-between p-4 sm:p-5 text-white transition-opacity duration-300">
                  <div className="flex justify-end">
                    <div className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white shadow-xl">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white/70 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>Teide National Park, Tenerife</span>
                    </div>
                    <div className="text-xs font-mono font-semibold">
                      Sony A7 IV • 24-70mm GM • f/4 • 1/640s • ISO 100
                    </div>
                  </div>
                </div>
              </ProgressiveImage>
            )}
          />

          {/* ------------------------------------------------------- */}
          {/* PATTERN 2: CURATED EXHIBITION COVER (Hero & Home)       */}
          {/* ------------------------------------------------------- */}
          <ScenarioCard
            title="2. Curated Exhibition Cover"
            subtitle="Shared by Hero.tsx & HomeCollections.tsx"
            badge="Unified Pattern (2 Pages)"
            description="As you noticed, Hero and Home Collections share the exact same pattern: 16/10 aspect ratio, double-border archival frame, dynamic ring color, glowing halo, and 35mm reticles."
            codeSnippet={`// Used identically in Hero.tsx and HomeCollections.tsx:
<ProgressiveImage
  src={album.cover_image_url}
  thumbnailSrc={coverPhoto?.thumbnail_url}
  alt={album.title}
  aspectRatio="16/10"
  frame="archival"
  ringColor={accentColor} // e.g. '#6184D8' (Hero) or '#E2856E' (Home)
  glow
  hoverEffect="editorial"
  priority
>
  {/* 35mm Rangefinder viewfinder brackets */}
  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: accentColor }} />
  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: accentColor }} />
  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: accentColor }} />
  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: accentColor }} />
  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-widest text-white/90 bg-black/80 px-2 py-0.5 rounded border border-white/20 uppercase">
    LEICA M11 • 35MM
  </div>
</ProgressiveImage>`}
            cardId="scen-2"
            copiedId={copiedId}
            onCopyCode={handleCopyCode}
            renderPreview={(key) => {
              const isHeroMode = coverContext === "hero";
              const activeColor = isHeroMode ? "#6184D8" : "#E2856E";
              const activeImg = isHeroMode ? SAMPLE_PORTRAIT : SAMPLE_LANDSCAPE;

              return (
                <div className="space-y-3">
                  {/* Context Switcher: Hero vs Home */}
                  <div className="flex items-center justify-between text-[11px] font-mono bg-foreground/5 p-1 rounded-xl border border-foreground/10">
                    <button
                      onClick={() => setCoverContext("hero")}
                      className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        isHeroMode
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-foreground/70 hover:text-foreground"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-blue-300" />
                      <span>Hero Mode (#6184D8)</span>
                    </button>
                    <button
                      onClick={() => setCoverContext("home")}
                      className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        !isHeroMode
                          ? "bg-[#E2856E] text-white font-semibold shadow-xs"
                          : "text-foreground/70 hover:text-foreground"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-orange-200" />
                      <span>Home Mode (#E2856E)</span>
                    </button>
                  </div>

                  {/* Render the unified component */}
                  <ProgressiveImage
                    key={`s2-${key}-${masterCycle}-${coverContext}`}
                    src={activeImg.src}
                    thumbnailSrc={activeImg.lqip}
                    dominantColor={activeImg.dominantColor}
                    alt="Exhibition Cover"
                    aspectRatio="16/10"
                    frame="archival"
                    ringColor={activeColor}
                    glow
                    hoverEffect="editorial"
                    simulatedDelayMs={delayMs}
                    transitionDuration={transitionDuration}
                  >
                    {/* Rangefinder Viewfinder Reticles matching Curated Collections */}
                    <div
                      className="absolute top-3 sm:top-4 left-3 sm:left-4 w-4 sm:w-5 h-4 sm:h-5 border-t-2 border-l-2 opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-20 group-hover/img:translate-x-1 group-hover/img:translate-y-1 pointer-events-none"
                      style={{ borderColor: activeColor }}
                    />
                    <div
                      className="absolute top-3 sm:top-4 right-3 sm:right-4 w-4 sm:w-5 h-4 sm:h-5 border-t-2 border-r-2 opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-20 group-hover/img:-translate-x-1 group-hover/img:translate-y-1 pointer-events-none"
                      style={{ borderColor: activeColor }}
                    />
                    <div
                      className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 w-4 sm:w-5 h-4 sm:h-5 border-b-2 border-l-2 opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-20 group-hover/img:translate-x-1 group-hover/img:-translate-y-1 pointer-events-none"
                      style={{ borderColor: activeColor }}
                    />
                    <div
                      className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-4 sm:w-5 h-4 sm:h-5 border-b-2 border-r-2 opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-20 group-hover/img:-translate-x-1 group-hover/img:-translate-y-1 pointer-events-none"
                      style={{ borderColor: activeColor }}
                    />
                    <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 text-[8px] sm:text-[9px] font-mono tracking-widest text-white/90 bg-black/80 px-2 sm:px-2.5 py-0.5 rounded border border-white/20 uppercase pointer-events-none max-w-[90%] truncate">
                      {isHeroMode ? "LEICA M11 • 35MM SUMMILUX" : "01 ARCHIVE SERIES"}
                    </div>
                  </ProgressiveImage>
                </div>
              );
            }}
          />

          {/* ------------------------------------------------------- */}
          {/* PATTERN 3: FULL-SCREEN THEATER (Lightbox)               */}
          {/* ------------------------------------------------------- */}
          <ScenarioCard
            title="3. Lightbox Theater Modal"
            subtitle="Used in Lightbox.tsx (Full-Screen)"
            badge="Pattern 3"
            description="Inside the full-screen Lightbox. Uses objectFit='contain' with no hover zoom. Click the preview or the button to launch the full-screen theater demo!"
            codeSnippet={`<ProgressiveImage
  src={currentPhoto.url}
  thumbnailSrc={currentPhoto.thumbnail_url}
  alt="Fullscreen Photo"
  variant="fade"
  objectFit="contain"
  hoverEffect="none"
  aspectRatio={currentPhoto.aspectRatio}
/>`}
            cardId="scen-3"
            copiedId={copiedId}
            onCopyCode={handleCopyCode}
            renderPreview={(key) => {
              const cur = lightboxPhotos[lightboxIndex];
              return (
                <div className="space-y-3">
                  {/* Clickable Preview Stage */}
                  <div
                    onClick={() => setIsLightboxOpen(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsLightboxOpen(true);
                      }
                    }}
                    className="relative rounded-2xl bg-black/60 border border-white/10 p-2 overflow-hidden flex items-center justify-center cursor-pointer group/modal transition-all hover:border-primary/50 shadow-inner"
                    title="Click to open full-screen lightbox theater"
                  >
                    <ProgressiveImage
                      key={`s3-${key}-${masterCycle}-${lightboxIndex}`}
                      src={cur.src}
                      thumbnailSrc={cur.lqip}
                      dominantColor={cur.dominantColor}
                      alt="Lightbox Still"
                      aspectRatio={cur.aspectRatio}
                      variant="fade"
                      objectFit="contain"
                      hoverEffect="none"
                      simulatedDelayMs={delayMs * 0.7}
                      transitionDuration={transitionDuration}
                    />

                    {/* Hover Overlay Hint */}
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover/modal:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-mono font-medium z-30 pointer-events-none">
                      <Maximize2 className="h-4 w-4 text-primary" />
                      <span>Click to Open Fullscreen Theater</span>
                    </div>
                  </div>

                  {/* Launch Fullscreen Button */}
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="w-full py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-semibold shadow-xs"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Launch Fullscreen Theater Demo</span>
                  </button>

                  {/* Photo Switcher Navigation */}
                  <div className="flex items-center justify-between text-xs font-mono px-1">
                    <button
                      onClick={() => setLightboxIndex((i) => (i === 0 ? 1 : 0))}
                      className="flex items-center gap-1 text-foreground/70 hover:text-foreground p-1 rounded-md bg-foreground/5 hover:bg-foreground/10 cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </button>
                    <span className="text-[11px] text-foreground/50">
                      Still #{lightboxIndex + 1} of 2
                    </span>
                    <button
                      onClick={() => setLightboxIndex((i) => (i === 0 ? 1 : 0))}
                      className="flex items-center gap-1 text-foreground/70 hover:text-foreground p-1 rounded-md bg-foreground/5 hover:bg-foreground/10 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            }}
          />

          {/* ------------------------------------------------------- */}
          {/* PATTERN 4: ARTIST ARCHIVAL PORTRAIT (AboutPage)         */}
          {/* ------------------------------------------------------- */}
          <ScenarioCard
            title="4. About Page Bio Portrait"
            subtitle="Used in src/app/about/page.tsx"
            badge="Pattern 4"
            description="Daniel's portrait frame on the About page. Features true 4:5 vertical proportion, double museum frame, primary color ring on hover, and base64 blur."
            codeSnippet={`<ProgressiveImage
  src="/about-portrait.jpg"
  blurDataURL="data:image/webp;base64,..."
  alt="Daniel García portrait"
  aspectRatio="4/5"
  frame="archival"
  ringColor="#6184D8"
  glow
  hoverEffect="subtle"
  priority
  quality={90}
/>`}
            cardId="scen-4"
            copiedId={copiedId}
            onCopyCode={handleCopyCode}
            renderPreview={(key) => (
              <ProgressiveImage
                key={`s4-${key}-${masterCycle}`}
                src={SAMPLE_PORTRAIT.src}
                blurDataURL={SAMPLE_PORTRAIT.lqip}
                dominantColor={SAMPLE_PORTRAIT.dominantColor}
                alt="Daniel García"
                aspectRatio="4/5"
                frame="archival"
                ringColor="#6184D8"
                glow
                hoverEffect="subtle"
                simulatedDelayMs={delayMs}
                transitionDuration={transitionDuration}
              />
            )}
          />

        </div>

        {/* Architecture Checklist Callout */}
        <div className="p-6 sm:p-8 rounded-3xl border border-primary/30 bg-primary/5 space-y-4">
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest font-semibold">
            <Camera className="h-4 w-4" />
            <span>Architecture Consolidation Summary</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1.5">
              <div className="font-semibold text-foreground">4 Patterns, 1 Component</div>
              <p className="text-foreground/70 text-xs leading-relaxed">
                Rather than scattered image implementations, the entire portfolio is powered by{" "}
                <code className="bg-foreground/10 px-1 rounded">&lt;ProgressiveImage /&gt;</code> in 4 curated visual roles.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="font-semibold text-foreground">Unified Exhibition Cover</div>
              <p className="text-foreground/70 text-xs leading-relaxed">
                <strong>Hero.tsx</strong> and <strong>HomeCollections.tsx</strong> now share the exact same
                archival frame, viewfinder brackets, and color ring props without copy-pasted CSS.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="font-semibold text-foreground">3B Active Pulse Standard</div>
              <p className="text-foreground/70 text-xs leading-relaxed">
                All photos display the organic breathing pulse on their low-res thumbnail, smoothly de-blurring into 4K.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* FULLSCREEN LIGHTBOX MODAL DEMO */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 select-none"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between z-10 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                LIGHTBOX THEATER DEMO
              </span>
              <span className="text-white/40 text-xs font-mono hidden sm:inline">
                Pattern 3: ProgressiveImage in modal
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/70 bg-white/10 px-3 py-1 rounded-full">
                Still {lightboxIndex + 1} of {lightboxPhotos.length}
              </span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Lightbox (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Center Stage with Prev / Next Navigation */}
          <div className="relative flex-grow flex items-center justify-center p-2 sm:p-6 my-auto">
            {/* Prev Button */}
            <button
              onClick={() => setLightboxIndex((i) => (i === 0 ? lightboxPhotos.length - 1 : i - 1))}
              className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title="Previous Photo (Left Arrow)"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Centered Progressive Image */}
            <div className="relative w-full max-w-4xl max-h-[75vh] flex items-center justify-center">
              <ProgressiveImage
                key={`modal-img-${lightboxIndex}-${masterCycle}`}
                src={lightboxPhotos[lightboxIndex].src}
                thumbnailSrc={lightboxPhotos[lightboxIndex].lqip}
                dominantColor={lightboxPhotos[lightboxIndex].dominantColor}
                alt="Fullscreen Lightbox Photo"
                aspectRatio={lightboxPhotos[lightboxIndex].aspectRatio}
                variant="fade"
                objectFit="contain"
                hoverEffect="none"
                simulatedDelayMs={delayMs * 0.7}
                transitionDuration={transitionDuration}
                className="rounded-2xl shadow-2xl"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={() => setLightboxIndex((i) => (i === lightboxPhotos.length - 1 ? 0 : i + 1))}
              className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title="Next Photo (Right Arrow)"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/60 border-t border-white/10 pt-4 z-10">
            <div className="flex items-center gap-4">
              <span className="text-white/90 font-medium">
                {lightboxIndex === 0 ? "Mount Teide, Tenerife (Landscape)" : "Daniel García — Archival Bio (Portrait)"}
              </span>
              <span className="text-white/30 hidden sm:inline">•</span>
              <span className="hidden sm:inline">Simulated Latency: {Math.round(delayMs * 0.7)}ms</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMasterCycle((c) => c + 1)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Replay Load</span>
              </button>
              <span className="text-[11px] text-white/40 hidden md:inline">
                (Press Esc or Left/Right keys)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SCENARIO CARD WRAPPER
// -------------------------------------------------------------
interface ScenarioCardProps {
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  codeSnippet: string;
  cardId: string;
  copiedId: string | null;
  onCopyCode: (id: string, code: string) => void;
  renderPreview: (cycleKey: number) => React.ReactNode;
}

function ScenarioCard({
  title,
  subtitle,
  badge,
  description,
  codeSnippet,
  cardId,
  copiedId,
  onCopyCode,
  renderPreview,
}: ScenarioCardProps) {
  const [localCycle, setLocalCycle] = useState(0);
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="flex flex-col rounded-3xl border border-foreground/15 bg-card/60 backdrop-blur-md overflow-hidden shadow-lg transition-all duration-300 hover:border-foreground/30">
      
      {/* Header Bar */}
      <div className="p-5 border-b border-foreground/10 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/40 bg-primary/10 text-primary font-semibold">
              {badge}
            </span>
          </div>
          <h2 className="font-serif text-lg font-bold text-foreground leading-tight">
            {title}
          </h2>
          <p className="text-xs text-foreground/60 font-mono mt-0.5">{subtitle}</p>
        </div>

        {/* Individual Replay Button */}
        <button
          onClick={() => setLocalCycle((c) => c + 1)}
          title="Replay this scenario"
          className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 active:scale-90 transition-all text-foreground/70 hover:text-foreground cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Live Preview Stage */}
      <div className="p-5 flex-grow flex items-center justify-center bg-foreground/[0.02]">
        <div className="w-full max-w-sm rounded-2xl p-2 border border-foreground/10 bg-background/50 shadow-inner">
          {renderPreview(localCycle)}
        </div>
      </div>

      {/* Description & Code Accordion */}
      <div className="p-5 border-t border-foreground/10 space-y-3 bg-foreground/[0.01]">
        <p className="text-xs text-foreground/75 leading-relaxed">{description}</p>

        <div className="pt-1 flex items-center justify-between">
          <button
            onClick={() => setShowCode(!showCode)}
            className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Code2 className="h-3 w-3" />
            <span>{showCode ? "Hide snippet" : "View code"}</span>
          </button>

          {showCode && (
            <button
              onClick={() => onCopyCode(cardId, codeSnippet)}
              className="text-[11px] font-mono text-foreground/60 hover:text-foreground flex items-center gap-1 cursor-pointer"
            >
              {copiedId === cardId ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Code Snippet Box */}
        {showCode && (
          <pre className="p-3 rounded-xl bg-foreground/5 border border-foreground/10 text-[11px] font-mono text-foreground/80 overflow-x-auto leading-relaxed">
            <code>{codeSnippet}</code>
          </pre>
        )}
      </div>

    </div>
  );
}
