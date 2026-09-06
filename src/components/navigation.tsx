"use client";

import Link from "next/link";
import { ApertureToggle } from "./aperture-toggle";
import { Logo } from "@/components/logo";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Menu, X, Compass, Images, User, LayoutDashboard, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navigation() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if session exists to show Admin dashboard link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-lg transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 md:px-12 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo Header */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 sm:gap-3 py-1 transition-all"
        >
          {/* Viewfinder Icon Glass Container */}
          <div className="relative p-1.5 sm:p-2 rounded-xl border border-foreground/10 bg-foreground/[0.03] group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:shadow-[0_0_15px_rgba(217,107,39,0.15)] transition-all duration-300 flex items-center justify-center shrink-0">
            <Logo className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            
            {/* Corner Tech Accents */}
            <span className="absolute -top-0.5 -left-0.5 w-1 h-1 border-t border-l border-foreground/40 group-hover:border-primary transition-colors duration-300" />
            <span className="absolute -bottom-0.5 -right-0.5 w-1 h-1 border-b border-r border-foreground/40 group-hover:border-primary transition-colors duration-300" />
          </div>

          {/* Brand Name & Subtitle */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center font-serif text-sm min-[380px]:text-base sm:text-lg md:text-xl font-bold tracking-wider text-foreground group-hover:text-foreground/90 transition-colors leading-tight truncate">
              <span>DANI&apos;S STILLS</span>
            </div>
            
            <div className="flex items-center gap-2 text-[8px] min-[380px]:text-[9px] font-mono tracking-[0.18em] sm:tracking-[0.2em] text-foreground/50 uppercase group-hover:text-primary/80 transition-colors leading-none mt-0.5">
              <span>VISUAL ARCHIVE</span>
            </div>
          </div>
        </Link>

        {/* Desktop Links & Aperture Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-8">
          <nav className="hidden sm:flex items-center gap-6 md:gap-8 text-xs font-mono tracking-widest uppercase">
            <Link
              href="/"
              className={`relative py-1 transition-colors duration-300 ${
                pathname === "/" ? "text-primary font-bold" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <span>Exhibition</span>
              {pathname === "/" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>

            <Link
              href="/destinations"
              className={`relative py-1 transition-colors duration-300 ${
                pathname?.startsWith("/destinations") ? "text-primary font-bold" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <span>Spatial Index</span>
              {pathname?.startsWith("/destinations") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>

            {isAdmin && (
              <Link
                href="/limonada"
                className={`relative py-1 transition-colors duration-300 ${
                  pathname?.startsWith("/limonada") ? "text-primary font-bold" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                <span>Dashboard</span>
                {pathname?.startsWith("/limonada") && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            )}

            <Link
              href="/how-it-works"
              className={`relative py-1 transition-colors duration-300 ${
                pathname === "/how-it-works" ? "text-primary font-bold" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <span>How It Works</span>
              {pathname === "/how-it-works" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>

            <Link
              href="/about"
              className={`relative py-1 transition-colors duration-300 ${
                pathname === "/about" ? "text-primary font-bold" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <span>About</span>
              {pathname === "/about" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          </nav>

          <div className="h-6 w-px bg-foreground/15 hidden sm:block" />

          {/* Aperture Theme Toggle */}
          <ApertureToggle />

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden min-h-[44px] min-w-[44px] p-2.5 rounded-full border border-foreground/15 bg-background/80 text-foreground hover:border-primary active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="sm:hidden border-b border-foreground/10 bg-background/95 backdrop-blur-xl px-6 py-6 space-y-4 font-mono text-xs uppercase tracking-widest overflow-hidden"
          >
            <Link
              href="/"
              className={`flex items-center gap-3 py-3 px-4 rounded-xl border transition-all ${
                pathname === "/"
                  ? "border-primary/50 bg-primary/10 text-primary font-bold"
                  : "border-foreground/10 text-foreground/80 hover:bg-foreground/5"
              }`}
            >
              <Images className="h-4 w-4" />
              <span>Exhibition</span>
            </Link>

            <Link
              href="/destinations"
              className={`flex items-center gap-3 py-3 px-4 rounded-xl border transition-all ${
                pathname?.startsWith("/destinations")
                  ? "border-primary/50 bg-primary/10 text-primary font-bold"
                  : "border-foreground/10 text-foreground/80 hover:bg-foreground/5"
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Spatial Index</span>
            </Link>

            {isAdmin && (
              <Link
                href="/limonada"
                className={`flex items-center gap-3 py-3 px-4 rounded-xl border transition-all ${
                  pathname?.startsWith("/limonada")
                    ? "border-primary/50 bg-primary/10 text-primary font-bold"
                    : "border-foreground/10 text-foreground/80 hover:bg-foreground/5"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}

            <Link
              href="/how-it-works"
              className={`flex items-center gap-3 py-3 px-4 rounded-xl border transition-all ${
                pathname === "/how-it-works"
                  ? "border-primary/50 bg-primary/10 text-primary font-bold"
                  : "border-foreground/10 text-foreground/80 hover:bg-foreground/5"
              }`}
            >
              <Cpu className="h-4 w-4" />
              <span>How It Works</span>
            </Link>

            <Link
              href="/about"
              className={`flex items-center gap-3 py-3 px-4 rounded-xl border transition-all ${
                pathname === "/about"
                  ? "border-primary/50 bg-primary/10 text-primary font-bold"
                  : "border-foreground/10 text-foreground/80 hover:bg-foreground/5"
              }`}
            >
              <User className="h-4 w-4" />
              <span>About</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
