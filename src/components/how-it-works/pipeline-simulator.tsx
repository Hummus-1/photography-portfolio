"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders,
  Copy,
  Check,
  Sparkles,
  Camera,
  Cpu,
  Maximize2,
  FileCheck,
  Percent,
} from "lucide-react";

interface SamplePhotoSpec {
  id: string;
  name: string;
  location: string;
  url: string;
  aspectRatio: number;
  rawSize: string;
  webpSize: string;
  compressionRatio: string;
  colors: string[];
  exif: {
    camera: string;
    lens: string;
    focalLength: string;
    aperture: string;
    shutter: string;
    iso: number;
    date: string;
  };
  aiTags: { tag: string; confidence: number }[];
}

const SAMPLE_PHOTOS: SamplePhotoSpec[] = [
  {
    id: "greenland",
    name: "Disko Bay Iceberg",
    location: "Ilulissat, Norway",
    url: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=1200&auto=format&fit=crop",
    aspectRatio: 1.5,
    rawSize: "28.4 MB (Fujifilm RAF)",
    webpSize: "412 KB (WebP 80%)",
    compressionRatio: "98.5%",
    colors: ["#2d404e", "#688094", "#b2c5d4", "#d9e5ee", "#18242e"],
    exif: {
      camera: "Fujifilm X-T5",
      lens: "Sigma 18-50mm F2.8 DC DN",
      focalLength: "35mm",
      aperture: "f/5.6",
      shutter: "1/500s",
      iso: 160,
      date: "2024-07-14",
    },
    aiTags: [
      { tag: "glacier", confidence: 96 },
      { tag: "iceberg", confidence: 94 },
      { tag: "ocean", confidence: 89 },
      { tag: "nordic", confidence: 85 },
      { tag: "chiaroscuro", confidence: 78 },
    ],
  },
  {
    id: "iceland",
    name: "Skógafoss Volcanic Plume",
    location: "South Coast, Iceland",
    url: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=1200&auto=format&fit=crop",
    aspectRatio: 1.33,
    rawSize: "31.2 MB (Fujifilm RAF)",
    webpSize: "498 KB (WebP 80%)",
    compressionRatio: "98.4%",
    colors: ["#1c1d1f", "#3c4349", "#7a858d", "#c5ced6", "#d96b27"],
    exif: {
      camera: "Fujifilm X-T5",
      lens: "Sigma 10-18mm F2.8 DC DN",
      focalLength: "12mm",
      aperture: "f/8.0",
      shutter: "1/250s",
      iso: 125,
      date: "2024-09-02",
    },
    aiTags: [
      { tag: "waterfall", confidence: 98 },
      { tag: "volcanic", confidence: 91 },
      { tag: "basalt", confidence: 87 },
      { tag: "mist", confidence: 83 },
      { tag: "landscape", confidence: 79 },
    ],
  },
  {
    id: "canary",
    name: "Teide Volcanic Caldera",
    location: "Teide National Park, Tenerife",
    url: "/teide.jpg",
    aspectRatio: 1.5,
    rawSize: "24.8 MB (Sony ARW)",
    webpSize: "385 KB (WebP 80%)",
    compressionRatio: "98.4%",
    colors: ["#2c1f1d", "#5c3d2e", "#8c5a43", "#c48866", "#e0b08a"],
    exif: {
      camera: "Sony α6000",
      lens: "Sony E 18-135mm F3.5-5.6",
      focalLength: "35mm",
      aperture: "f/6.3",
      shutter: "1/500s",
      iso: 100,
      date: "2024-11-20",
    },
    aiTags: [
      { tag: "volcano", confidence: 97 },
      { tag: "teide", confidence: 94 },
      { tag: "basalt", confidence: 90 },
      { tag: "sunset", confidence: 86 },
      { tag: "canary-islands", confidence: 82 },
    ],
  },
];

export function PipelineSimulator() {
  const [selectedPhoto, setSelectedPhoto] = useState<SamplePhotoSpec>(SAMPLE_PHOTOS[0]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"exif" | "palette" | "ai" | "compression">("ai");

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Photo Selector Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-film-amber font-semibold">
          <Sliders className="h-4 w-4" />
          <span>Interactive Media Pipeline Simulator</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-foreground/50 uppercase tracking-widest hidden sm:inline-block">
            Sample Subject:
          </span>
          <div className="flex items-center gap-1.5">
            {SAMPLE_PHOTOS.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  selectedPhoto.id === photo.id
                    ? "bg-film-amber text-white font-bold shadow-md"
                    : "bg-foreground/5 border border-foreground/10 text-foreground/70 hover:bg-foreground/10"
                }`}
              >
                {photo.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulator Workbench Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photo Preview & Aspect Metric (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative p-2 rounded-3xl border border-foreground/15 bg-background shadow-xl overflow-hidden group">
            <div
              className="relative w-full rounded-2xl overflow-hidden bg-foreground/5"
              style={{ aspectRatio: selectedPhoto.aspectRatio }}
            >
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Overlay Badges */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-white uppercase tracking-widest border border-white/20">
                {selectedPhoto.location}
              </div>

              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-film-amber/90 backdrop-blur-md text-[10px] font-mono text-white font-bold tracking-wider">
                Ratio: {selectedPhoto.aspectRatio.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl border border-foreground/10 bg-foreground/[0.02] space-y-1">
              <div className="text-[10px] text-foreground/50 uppercase tracking-widest">
                RAW Source
              </div>
              <div className="font-semibold text-foreground truncate">
                {selectedPhoto.rawSize}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-film-amber/30 bg-film-amber/5 space-y-1">
              <div className="text-[10px] text-film-amber font-semibold uppercase tracking-widest">
                WebP Optimization
              </div>
              <div className="font-semibold text-film-amber truncate">
                {selectedPhoto.webpSize}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Pipeline Data Inspector (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Sub-Tab Navigation */}
          <div className="flex border-b border-foreground/10 gap-2 font-mono text-xs uppercase tracking-widest overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("ai")}
              className={`py-2 px-3 border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === "ai"
                  ? "border-film-amber text-film-amber font-bold"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Semantic Tags</span>
            </button>

            <button
              onClick={() => setActiveTab("palette")}
              className={`py-2 px-3 border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === "palette"
                  ? "border-film-amber text-film-amber font-bold"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Color Palette</span>
            </button>

            <button
              onClick={() => setActiveTab("exif")}
              className={`py-2 px-3 border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === "exif"
                  ? "border-film-amber text-film-amber font-bold"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>EXIF Camera Data</span>
            </button>

            <button
              onClick={() => setActiveTab("compression")}
              className={`py-2 px-3 border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === "compression"
                  ? "border-film-amber text-film-amber font-bold"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Compression Stats</span>
            </button>
          </div>

          {/* Active Tab Content Area */}
          <div className="p-6 rounded-2xl border border-foreground/15 bg-background/80 min-h-[280px]">
            <AnimatePresence mode="wait">
              {/* AI Vision Tags View */}
              {activeTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-foreground/60 uppercase tracking-widest">
                      Model: @cf/openai/clip-vit-base-patch32
                    </span>
                    <span className="text-film-amber font-semibold">
                      Threshold: &gt; 0.15
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedPhoto.aiTags.map((item) => (
                      <div key={item.tag} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-foreground font-semibold uppercase tracking-wider">
                            #{item.tag}
                          </span>
                          <span className="text-foreground/60">{item.confidence}% confidence</span>
                        </div>
                        <div className="h-2 w-full bg-foreground/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.confidence}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-film-amber/70 to-film-amber rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Color Palette View */}
              {activeTab === "palette" && (
                <motion.div
                  key="palette"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="text-xs font-mono text-foreground/70 leading-relaxed">
                    Extracted via Sharp downsampling (5x5 matrix pixel clusters). Click any color circle to copy hex code to clipboard.
                  </div>

                  {/* Swatches Grid */}
                  <div className="grid grid-cols-5 gap-3">
                    {selectedPhoto.colors.map((hex) => (
                      <button
                        key={hex}
                        onClick={() => copyToClipboard(hex)}
                        className="group flex flex-col items-center gap-2 p-2 rounded-xl border border-foreground/10 hover:border-film-amber transition-all cursor-pointer"
                      >
                        <div
                          className="size-12 rounded-full border border-black/20 shadow-inner transition-transform group-hover:scale-110 flex items-center justify-center text-white"
                          style={{ backgroundColor: hex }}
                        >
                          {copiedHex === hex ? (
                            <Check className="h-4 w-4 drop-shadow" />
                          ) : (
                            <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-foreground/80 uppercase font-semibold">
                          {hex}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* EXIF Data View */}
              {activeTab === "exif" && (
                <motion.div
                  key="exif"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 font-mono text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                      <div className="text-[10px] text-foreground/50 uppercase tracking-widest">Camera Body</div>
                      <div className="font-bold text-foreground mt-1">{selectedPhoto.exif.camera}</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                      <div className="text-[10px] text-foreground/50 uppercase tracking-widest">Lens Optic</div>
                      <div className="font-bold text-foreground mt-1">{selectedPhoto.exif.lens}</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                      <div className="text-[10px] text-foreground/50 uppercase tracking-widest">Focal Length & Aperture</div>
                      <div className="font-bold text-foreground mt-1">{selectedPhoto.exif.focalLength} • {selectedPhoto.exif.aperture}</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                      <div className="text-[10px] text-foreground/50 uppercase tracking-widest">Shutter & ISO</div>
                      <div className="font-bold text-foreground mt-1">{selectedPhoto.exif.shutter} • ISO {selectedPhoto.exif.iso}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Compression View */}
              {activeTab === "compression" && (
                <motion.div
                  key="compression"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5 font-mono text-xs"
                >
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      <span className="font-semibold">Bandwidth Savings Rate</span>
                    </div>
                    <span className="font-bold text-lg">{selectedPhoto.compressionRatio}</span>
                  </div>

                  <div className="space-y-3 text-foreground/80">
                    <div className="flex justify-between border-b border-foreground/10 pb-2">
                      <span>Original RAW Format</span>
                      <span className="font-bold">{selectedPhoto.rawSize}</span>
                    </div>
                    <div className="flex justify-between border-b border-foreground/10 pb-2">
                      <span>Sharp WebP Output (2048px)</span>
                      <span className="font-bold text-film-amber">{selectedPhoto.webpSize}</span>
                    </div>
                    <div className="flex justify-between border-b border-foreground/10 pb-2">
                      <span>Timeline WebP Thumbnail (300px)</span>
                      <span className="font-bold text-foreground/60">~38 KB</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
