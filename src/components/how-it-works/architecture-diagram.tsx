"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Server,
  Sparkles,
  Database,
  Monitor,
  CheckCircle2,
  Code2,
  Layers,
  Zap,
} from "lucide-react";

interface PipelineStep {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: any;
  tech: string[];
  summary: string;
  details: string[];
  codeSnippet: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "ingestion",
    number: "01",
    title: "EXIF & Field Metadata",
    subtitle: "Binary Header Inspection",
    icon: Camera,
    tech: ["exifr", "Buffer", "TypeScript"],
    summary:
      "When a photo is captured on Fujifilm or Sony camera bodies, raw EXIF metadata is embedded directly into the JPEG/RAW binary headers.",
    details: [
      "Parses camera body model, lens serial, aperture (f-number), shutter speed, and focal length.",
      "Extracts high-precision GPS latitude and longitude coordinates for spatial indexing.",
      "Reads original capture timestamp to apply time-of-day contextual rules (e.g., night, golden-hour).",
    ],
    codeSnippet: `// API Route: /api/upload
import exifr from 'exifr';

const exif = await exifr.parse(imageBuffer, {
  pick: ['Make', 'Model', 'LensModel', 'FNumber', 'ExposureTime', 'ISO', 'FocalLength', 'latitude', 'longitude', 'DateTimeOriginal']
});`,
  },
  {
    id: "processing",
    number: "02",
    title: "Dual WebP & Palette",
    subtitle: "Pixel Matrix Resizing",
    icon: Server,
    tech: ["sharp", "Matrix Sampling", "WebP 80%"],
    summary:
      "The server resizes high-resolution camera files into optimized WebP formats and samples pixel matrices to compute dominant colors.",
    details: [
      "Main Display Image: Compressed to WebP format, max width 2048px at 80% quality (retaining crisp image clarity without bandwidth bloat).",
      "Timeline Thumbnail: Compressed to WebP format, max width 300px at 75% quality for instant loading on vertical timelines.",
      "Color Palette Analysis: Downscales image to 5x5 matrix, samples pixel clusters, and extracts 5 dominant HSL/Hex color codes.",
    ],
    codeSnippet: `// Sharp Dual Compression & Color Palette Extraction
const mainWebP = await sharp(buffer)
  .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 80 })
  .toBuffer();

// Downsample to 5x5 grid for dominant color swatches
const paletteBuffer = await sharp(buffer).resize(5, 5, { fit: 'fill' }).raw().toBuffer();
const hexColors = extract5DominantHex(paletteBuffer);`,
  },
  {
    id: "ai-vision",
    number: "03",
    title: "Automated Tagging Engine",
    subtitle: "Vision Embeddings & Rules",
    icon: Sparkles,
    tech: ["CLIP Model", "Cloudflare Workers", "Vector Embeddings"],
    summary:
      "Cloudflare's CLIP vision model analyzes thumbnail vector embeddings to automatically index subjects, landscapes, lighting, and mood.",
    details: [
      "Converts 300px thumbnail buffer to base64 vector input.",
      "Evaluates prompt score probabilities against predefined photography labels (e.g. glacier, basalt, sunset, ocean, chiaroscuro).",
      "Merges predicted tags (> 0.15 threshold) with temporal metadata (e.g., automatically tagging 'night' for shots between 8 PM and 6 AM).",
    ],
    codeSnippet: `// Cloudflare Workers CLIP Vision Embedding Request
const response = await fetch(
  \`https://api.cloudflare.com/client/v4/accounts/\${CF_ACCOUNT}/ai/run/@cf/openai/clip-vit-base-patch32\`,
  {
    method: 'POST',
    headers: { Authorization: \`Bearer \${CF_TOKEN}\` },
    body: JSON.stringify({ image: base64Thumbnail, candidate_labels: PROMPT_TAGS })
  }
);`,
  },
  {
    id: "storage",
    number: "04",
    title: "Edge Storage & DB Index",
    subtitle: "Supabase & Cloudflare R2",
    icon: Database,
    tech: ["Cloudflare R2", "Supabase DB", "PostgreSQL RLS"],
    summary:
      "Compressed WebP binaries are stored on global S3-compatible Cloudflare R2 buckets, while metadata and tags are indexed in Supabase PostgreSQL.",
    details: [
      "Zero Egress Fees: Cloudflare R2 serves high-resolution photos globally with low latency.",
      "Relational Schema: \`albums\` and \`photos\` tables linked via foreign key cascades.",
      "Row Level Security (RLS): Public read access policies for published collections; strict JWT authentication for admin uploads.",
    ],
    codeSnippet: `-- Supabase PostgreSQL Schema & RLS Policy
CREATE TABLE public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  aspect_ratio NUMERIC(4,2) NOT NULL,
  color_palette TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  exif JSONB DEFAULT '{}'
);

CREATE POLICY "Public Read Photos" ON public.photos FOR SELECT USING (true);`,
  },
  {
    id: "presentation",
    number: "05",
    title: "Dynamic Visual Interface",
    subtitle: "Lenis, Masonry & Aperture",
    icon: Monitor,
    tech: ["Next.js 15", "Lenis Scroll", "Framer Motion"],
    summary:
      "The client renders an interactive exhibition gallery with zero Cumulative Layout Shift (CLS), smooth momentum scroll, and interactive EXIF HUDs.",
    details: [
      "Aspect Ratio Masonry: Pre-calculated \`width / height\` ratios prevent image shifting during page load.",
      "Interactive Aperture Lens: SVG aperture blade ring morphing between Light (F/1.4) and Dark (F/22) stops.",
      "Timeline Observer: IntersectionObserver synchronizes active scroll position with sticky timeline thumbnails.",
    ],
    codeSnippet: `// Zero-CLS Masonry & Interactive Photo Frame
<div style={{ aspectRatio: photo.aspect_ratio }}>
  <Image
    src={photo.url}
    alt={photo.location}
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover transition-transform duration-500"
  />
</div>`,
  },
];

export function ArchitectureDiagram() {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const activeStep = PIPELINE_STEPS[activeStepIndex];

  return (
    <div className="space-y-8">
      {/* Step Selector Horizontal Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {PIPELINE_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = idx === activeStepIndex;

          return (
            <button
              key={step.id}
              onClick={() => setActiveStepIndex(idx)}
              className={`relative p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between group overflow-hidden ${
                isActive
                  ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(217,107,39,0.15)] text-foreground"
                  : "border-foreground/15 bg-background/60 hover:border-primary/40 hover:bg-foreground/[0.02] text-foreground/70"
              }`}
            >
              {/* Subtle Step Number Background */}
              <span className="absolute top-2 right-3 font-mono text-xs font-bold text-foreground/20 group-hover:text-primary/40 transition-colors">
                {step.number}
              </span>

              <div className="space-y-3">
                <div
                  className={`size-10 rounded-xl flex items-center justify-center border transition-all ${
                    isActive
                      ? "border-primary bg-primary text-white"
                      : "border-foreground/10 bg-foreground/5 text-foreground/70 group-hover:border-primary/30 group-hover:text-primary"
                  }`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                    Stage {step.number}
                  </div>
                  <h4 className="font-serif text-sm font-bold text-foreground leading-snug">
                    {step.title}
                  </h4>
                </div>
              </div>

              {/* Active Indicator Line */}
              {isActive && (
                <motion.div
                  layoutId="active-step-bar"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Detail Showcase Panel for Active Step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-8 rounded-3xl border border-foreground/15 bg-foreground/[0.015] backdrop-blur-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-start shadow-xl"
        >
          {/* Left Column: Description & Feature Points (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                <Layers className="h-4 w-4" />
                <span>Stage {activeStep.number} Operational Deep Dive</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {activeStep.title}
              </h3>
              <p className="text-xs font-mono text-foreground/60 uppercase tracking-wider">
                {activeStep.subtitle}
              </p>
            </div>

            <p className="text-sm sm:text-base text-foreground/80 font-sans leading-relaxed">
              {activeStep.summary}
            </p>

            {/* Tech Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-mono text-foreground/50 uppercase tracking-widest mr-1">
                Technologies:
              </span>
              {activeStep.tech.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full border border-foreground/15 bg-background text-[11px] font-mono text-foreground/80"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Details Bullet List */}
            <div className="space-y-3 pt-4 border-t border-foreground/10">
              <div className="text-xs font-mono uppercase tracking-widest text-foreground/70 font-semibold">
                Key Processing Instructions:
              </div>
              <ul className="space-y-2.5">
                {activeStep.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-foreground/75 font-sans leading-normal">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Interactive Code Snippet Window (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-foreground/20 bg-black/90 dark:bg-black/80 p-4 font-mono text-xs text-foreground shadow-2xl overflow-hidden">
              {/* Window Controls Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 text-white/50 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-500/80" />
                  <span className="size-2.5 rounded-full bg-yellow-500/80" />
                  <span className="size-2.5 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-mono text-white/60">pipeline_stage_{activeStep.number}.ts</span>
                </div>
                <Code2 className="h-3.5 w-3.5 text-primary" />
              </div>

              {/* Code Display */}
              <pre className="overflow-x-auto p-2 text-[11px] leading-relaxed text-emerald-400 font-mono">
                <code>{activeStep.codeSnippet}</code>
              </pre>
            </div>

            {/* Interactive Control Hint */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-foreground/80">
                <Zap className="h-4 w-4 text-primary animate-pulse" />
                <span>Select any stage above to inspect system code</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-primary font-bold">
                <span>{activeStepIndex + 1} / {PIPELINE_STEPS.length}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
