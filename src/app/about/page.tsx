import { Navigation } from "@/components/navigation";
import Image from "next/image";
import { Camera, MapPin, Mail } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-400">
      <Navigation />

      <div className="mx-auto max-w-[1800px] px-6 md:px-12 py-16 md:py-28 flex-grow flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          
          {/* Portrait Image (5 cols) */}
          <div className="lg:col-span-5 relative aspect-[4/5] bg-foreground/5 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000"
              alt="Giulia Gartner portrait"
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              priority
              className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Description & Details (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <span className="text-xs font-mono tracking-widest uppercase text-foreground/50">
                behind the lens
              </span>
              <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                Giulia Gartner
              </h1>
            </div>

            <div className="space-y-6 text-foreground/80 text-base md:text-lg leading-relaxed max-w-2xl">
              <p>
                I am a photographer, filmmaker, and visual storyteller originating from the Dolomites in northern Italy. My work centers on the intersection of grand wildernesses and the human spirits that navigate them.
              </p>
              <p>
                Specializing in landscape, outdoor lifestyle, and travel photography, I seek to evoke a sensory experience through light, texture, and silence. I hope to inspire people to explore further, protect our wild spaces, and cherish the quiet moments of existence.
              </p>
            </div>

            {/* Gear & Tools Setup list */}
            <div className="border-t border-foreground/10 pt-8 space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-widest text-foreground/50">
                Selected Gear & Setup
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <li className="flex items-center gap-2.5">
                  <Camera className="h-4 w-4 shrink-0 opacity-70" />
                  <span>Sony Alpha 7R V (61.0 MP)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Camera className="h-4 w-4 shrink-0 opacity-70" />
                  <span>Sony FE 24-70mm f/2.8 GM II</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Camera className="h-4 w-4 shrink-0 opacity-70" />
                  <span>Sony FE 70-200mm f/2.8 GM OSS II</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Camera className="h-4 w-4 shrink-0 opacity-70" />
                  <span>Sony FE 50mm f/1.2 GM</span>
                </li>
              </ul>
            </div>

            {/* Contact row */}
            <div className="border-t border-foreground/10 pt-8 flex flex-wrap gap-8 items-center text-xs font-mono uppercase tracking-widest">
              <a
                href="mailto:giulia@stills.com"
                className="flex items-center gap-2 hover:opacity-75 transition-opacity cursor-none"
              >
                <Mail className="h-4 w-4" />
                <span>giulia@stills.com</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:opacity-75 transition-opacity cursor-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span>@giuligartner</span>
              </a>
              <span className="flex items-center gap-2 text-foreground/50">
                <MapPin className="h-4 w-4" />
                <span>Dolomites, Italy</span>
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
