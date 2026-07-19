import { Navigation } from "@/components/navigation";
import Image from "next/image";
import { Camera, MapPin, Mail, Code, Cpu, Globe, Terminal } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-400">
      <Navigation />

      <div className="w-full px-6 md:px-12 py-16 md:py-28 flex-grow flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          
          {/* Portrait Image (5 cols) */}
          <div className="lg:col-span-5 relative aspect-[4/5] bg-foreground/5 overflow-hidden">
            <Image
              src="/about-portrait.jpg"
              alt="Daniel García portrait"
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
                Daniel García
              </h1>
            </div>

            <div className="space-y-6 text-foreground/80 text-base md:text-lg leading-relaxed max-w-2xl">
              <p>
                I am a software engineer, visual creator, and developer based in Santa Cruz de Tenerife, Canary Islands. I specialize in building modern web applications with React, TypeScript, and Vue, alongside exploring creative frontiers like Unity VR, 3D graphics, and photography.
              </p>
              <p>
                For me, programming and design are two sides of the same coin. Whether crafting interactive visualizers, building immersive web tools, or capturing the volcanic landscapes and coastal horizons of the Canary Islands through a lens, I strive to merge technical precision with aesthetic exploration.
              </p>
            </div>

            {/* Gear & Tools Setup list */}
            <div className="border-t border-foreground/10 pt-8 space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-widest text-foreground/50">
                Toolkit & Technologies
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <li className="flex items-center gap-2.5">
                  <Terminal className="h-4 w-4 shrink-0 opacity-70" />
                  <span>TypeScript, JavaScript, Python & C++</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Cpu className="h-4 w-4 shrink-0 opacity-70" />
                  <span>React, Next.js, Vue & FastAPI</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 shrink-0 opacity-70" />
                  <span>Unity VR & 3D Interactive Design</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Camera className="h-4 w-4 shrink-0 opacity-70" />
                  <span>Visual Composition & Photography</span>
                </li>
              </ul>
            </div>

            {/* Contact row */}
            <div className="border-t border-foreground/10 pt-8 flex flex-col gap-6 text-xs font-mono uppercase tracking-widest">
              <div className="flex flex-wrap gap-8 items-center">
                <a
                  href="mailto:dani@danigh.dev"
                  className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                >
                  <Mail className="h-4 w-4" />
                  <span>dani@danigh.dev</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/daniel-garc%C3%ADa-hern%C3%A1ndez-866a99264/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                >
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://github.com/Hummus-1"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                >
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.behance.net/danielgarciaher2"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                >
                  <span>Behance</span>
                </a>
              </div>
              <div className="flex items-center gap-2 text-foreground/50">
                <MapPin className="h-4 w-4" />
                <span>Santa Cruz de Tenerife, Canary Islands</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
