import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { ArchitectureDiagram } from "@/components/how-it-works/architecture-diagram";
import { PipelineSimulator } from "@/components/how-it-works/pipeline-simulator";
import { ApertureDemo } from "@/components/how-it-works/aperture-demo";
import Link from "next/link";
import {
  Cpu,
  Database,
  Layers,
  Sparkles,
  Terminal,
  ArrowUpRight,
  Globe,
  Aperture,
  CheckCircle2,
  ShieldCheck,
  Zap,
  LayoutGrid,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How This Website Works | Dani's Stills Architecture",
  description:
    "An in-depth colophon detailing the automated visual tagging pipeline, image compression engine, database schema, and interactive optics powering Dani's Stills.",
};

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-400 selection:bg-primary selection:text-white">
      {/* Top Header Navigation */}
      <Navigation />

      {/* Main Container */}
      <main className="flex-grow w-full py-8 sm:py-12 md:py-20 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Eyebrow Colophon Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/10 pb-6 text-xs font-mono tracking-widest uppercase text-foreground/60">
            <div className="flex items-center gap-3">
              <span className="text-primary font-bold flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                SYSTEM COLOPHON
              </span>
              <span className="w-6 h-px bg-foreground/20" />
              <div className="flex items-center gap-2 text-foreground/80">
                <span>Architecture & Media Pipeline</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-foreground/50">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Next.js 15 • Supabase • Cloudflare Workers</span>
            </div>
          </div>

          {/* Page Hero Header */}
          <div className="space-y-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>Technical Colophon & Infrastructure Breakdown</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
              How This Website Works.
              <br />
              <span className="opacity-40 font-normal italic">
                From Digital RAW Capture to Global Edge Delivery.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-foreground/80 font-sans leading-relaxed max-w-3xl">
              Dani&apos;s Stills is engineered as a high-performance visual archive. Every photo uploaded passes through an automated cloud pipeline that parses binary EXIF camera data, extracts dominant 5-color palettes via pixel matrix sampling, classifies visual semantics using automated vision models, and delivers zero-CLS responsive exhibition grids.
            </p>
          </div>

          {/* 01 / ARCHITECTURE DIAGRAM & PIPELINE FLOW */}
          <section className="space-y-8 pt-6 border-t border-foreground/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span>SECTION 01 • DATA PIPELINE ARCHITECTURE</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                  The 5-Stage Cloud Ingestion Engine
                </h2>
              </div>
              <div className="text-xs font-mono text-foreground/50 uppercase tracking-widest">
                Interactive Stage Selector
              </div>
            </div>

            <ArchitectureDiagram />
          </section>

          {/* 02 / INTERACTIVE PIPELINE SIMULATOR */}
          <section className="space-y-8 pt-10 border-t border-foreground/10">
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span>SECTION 02 • INTERACTIVE WORKBENCH</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Test Live Metadata & Visual Tagging
              </h2>
            </div>

            <PipelineSimulator />
          </section>

          {/* 03 / OPTICS ENGINE & APERTURE SWITCHER */}
          <section className="space-y-8 pt-10 border-t border-foreground/10">
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
                <Aperture className="h-4 w-4" />
                <span>SECTION 03 • INTERACTIVE OPTICS & THEMING</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Camera Lens Iris Theme Switcher
              </h2>
            </div>

            <ApertureDemo />
          </section>

          {/* 04 / TECHNICAL DEEP DIVES GRID */}
          <section className="space-y-8 pt-10 border-t border-foreground/10">
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>SECTION 04 • CORE ARCHITECTURAL PILLARS</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Under the Hood: Database & Rendering Strategy
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Pillar 1 */}
              <div className="p-6 sm:p-8 rounded-3xl border border-foreground/15 bg-foreground/[0.015] space-y-4 hover:border-primary/40 transition-colors">
                <div className="size-10 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center font-mono font-bold text-xs">
                  01
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  PostgreSQL Schemas & Row Level Security
                </h3>
                <p className="text-xs sm:text-sm text-foreground/75 font-sans leading-relaxed">
                  Supabase hosts relational tables for <code className="font-mono text-primary">albums</code> and <code className="font-mono text-primary">photos</code>. RLS policies explicitly restrict insert, update, and delete mutations to authenticated admin JWT tokens while granting public select policies for published albums.
                </p>
                <div className="pt-2 text-xs font-mono text-foreground/50 uppercase tracking-widest">
                  Key Tech: Supabase RLS • PostgreSQL Indexing
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 sm:p-8 rounded-3xl border border-foreground/15 bg-foreground/[0.015] space-y-4 hover:border-primary/40 transition-colors">
                <div className="size-10 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center font-mono font-bold text-xs">
                  02
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Zero Cumulative Layout Shift (CLS) Masonry
                </h3>
                <p className="text-xs sm:text-sm text-foreground/75 font-sans leading-relaxed">
                  Every photo record stores precomputed <code className="font-mono text-primary">aspect_ratio = width / height</code> values. The Next.js image container enforces inline aspect ratios before image download, preventing jarring page layout reflows during image loading.
                </p>
                <div className="pt-2 text-xs font-mono text-foreground/50 uppercase tracking-widest">
                  Key Tech: Precomputed Ratios • CSS Grid
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 sm:p-8 rounded-3xl border border-foreground/15 bg-foreground/[0.015] space-y-4 hover:border-primary/40 transition-colors">
                <div className="size-10 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center font-mono font-bold text-xs">
                  03
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Lenis Momentum Scroll & Timeline Observer
                </h3>
                <p className="text-xs sm:text-sm text-foreground/75 font-sans leading-relaxed">
                  Smooth inertia scroll physics powered by Lenis are integrated with high-efficiency <code className="font-mono text-primary">IntersectionObserver</code> hooks to auto-highlight active timeline thumbnails as visitors navigate down photo collections.
                </p>
                <div className="pt-2 text-xs font-mono text-foreground/50 uppercase tracking-widest">
                  Key Tech: Lenis Scroll • IntersectionObserver
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-6 sm:p-8 rounded-3xl border border-foreground/15 bg-foreground/[0.015] space-y-4 hover:border-primary/40 transition-colors">
                <div className="size-10 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center font-mono font-bold text-xs">
                  04
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Atmospheric SVG Fractal Grain Overlay
                </h3>
                <p className="text-xs sm:text-sm text-foreground/75 font-sans leading-relaxed">
                  Rather than using bulky external video loops or PNG assets, film texture is produced using a pure SVG <code className="font-mono text-primary">&lt;feTurbulence&gt;</code> fractal noise matrix rendered as a fixed grain overlay.
                </p>
                <div className="pt-2 text-xs font-mono text-foreground/50 uppercase tracking-widest">
                  Key Tech: Inline SVG Noise • Zero Egress Overhead
                </div>
              </div>
            </div>
          </section>

          {/* 05 / FULL TECHNOLOGY SPECS TABLE */}
          <section className="space-y-8 pt-10 border-t border-foreground/10">
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>SECTION 05 • TECHNICAL STACK MATRIX</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Technology Colophon & Specs
              </h2>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-foreground/15 bg-background">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-foreground/15 bg-foreground/[0.03] text-primary uppercase tracking-widest">
                    <th className="py-4 px-6 font-bold">Layer / Domain</th>
                    <th className="py-4 px-6 font-bold">Technology / Service</th>
                    <th className="py-4 px-6 font-bold">Primary Function</th>
                    <th className="py-4 px-6 font-bold">Key NPM / SDK Package</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/10 text-foreground/80">
                  <tr className="hover:bg-foreground/[0.015] transition-colors">
                    <td className="py-4 px-6 font-bold text-foreground">Application Framework</td>
                    <td className="py-4 px-6">Next.js 15 (App Router)</td>
                    <td className="py-4 px-6">Server Components, API routes & routing</td>
                    <td className="py-4 px-6 text-foreground/60">next 15.x</td>
                  </tr>
                  <tr className="hover:bg-foreground/[0.015] transition-colors">
                    <td className="py-4 px-6 font-bold text-foreground">Language & Safety</td>
                    <td className="py-4 px-6">TypeScript 5</td>
                    <td className="py-4 px-6">Strict static type checking across API and UI</td>
                    <td className="py-4 px-6 text-foreground/60">typescript</td>
                  </tr>
                  <tr className="hover:bg-foreground/[0.015] transition-colors">
                    <td className="py-4 px-6 font-bold text-foreground">Database & Auth</td>
                    <td className="py-4 px-6">Supabase PostgreSQL</td>
                    <td className="py-4 px-6">Relational metadata storage & admin JWT session auth</td>
                    <td className="py-4 px-6 text-foreground/60">@supabase/supabase-js</td>
                  </tr>
                  <tr className="hover:bg-foreground/[0.015] transition-colors">
                    <td className="py-4 px-6 font-bold text-foreground">Media Asset CDN</td>
                    <td className="py-4 px-6">Cloudflare R2 Bucket</td>
                    <td className="py-4 px-6">Zero-egress S3 binary WebP image hosting</td>
                    <td className="py-4 px-6 text-foreground/60">@aws-sdk/client-s3</td>
                  </tr>
                  <tr className="hover:bg-foreground/[0.015] transition-colors">
                    <td className="py-4 px-6 font-bold text-foreground">Visual Semantic Tagging</td>
                    <td className="py-4 px-6">Cloudflare Workers Vision API</td>
                    <td className="py-4 px-6">CLIP model (@cf/openai/clip-vit-base-patch32) image embedding classification</td>
                    <td className="py-4 px-6 text-foreground/60">Cloudflare REST API</td>
                  </tr>
                  <tr className="hover:bg-foreground/[0.015] transition-colors">
                    <td className="py-4 px-6 font-bold text-foreground">Image Processing</td>
                    <td className="py-4 px-6">Sharp & Exifr</td>
                    <td className="py-4 px-6">Dual WebP compression, EXIF extraction & color sampling</td>
                    <td className="py-4 px-6 text-foreground/60">sharp, exifr</td>
                  </tr>
                  <tr className="hover:bg-foreground/[0.015] transition-colors">
                    <td className="py-4 px-6 font-bold text-foreground">Design System & Styling</td>
                    <td className="py-4 px-6">Tailwind CSS v4 & Framer Motion</td>
                    <td className="py-4 px-6">Custom theme tokens, glassmorphism & micro-animations</td>
                    <td className="py-4 px-6 text-foreground/60">tailwindcss, framer-motion</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 06 / EXPLORE CTA BANNER */}
          <div className="p-8 sm:p-10 rounded-3xl border border-primary/30 bg-primary/5 space-y-6 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Explore the Exhibition
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Experience the Portfolio in Action
              </h3>
              <p className="text-xs sm:text-sm text-foreground/80 font-sans leading-relaxed max-w-xl">
                Browse through photo collections, test the aperture lens toggle, inspect EXIF overlays, or explore spatial location indexes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-mono text-xs uppercase tracking-widest font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md cursor-pointer"
              >
                <span>Exhibition</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-foreground/20 hover:border-primary font-mono text-xs uppercase tracking-widest font-bold hover:text-primary transition-all cursor-pointer"
              >
                <span>Spatial Index</span>
              </Link>
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
            <span>Architecture & System Colophon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
