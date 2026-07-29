"use client";

import Link from "next/link";
import { ApertureToggle } from "./aperture-toggle";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Menu, X, Compass, Images, User, LayoutDashboard } from "lucide-react";
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
        
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-wider hover:opacity-85 transition-opacity"
        >
          <span>DANIEL GARCÍA</span>
          <span className="text-[10px] tracking-widest font-sans font-normal opacity-40 relative -top-1 sm:-top-2">©</span>
        </Link>

        {/* Desktop Links & Aperture Switcher */}
        <div className="flex items-center gap-4 sm:gap-8">
          <nav className="hidden sm:flex items-center gap-8 text-xs font-mono tracking-widest uppercase">
            <Link
              href="/"
              className={`relative py-1 transition-colors duration-300 ${
                pathname === "/" ? "text-film-amber font-bold" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <span>Exhibition</span>
              {pathname === "/" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-film-amber rounded-full" />
              )}
            </Link>

            <Link
              href="/destinations"
              className={`relative py-1 transition-colors duration-300 ${
                pathname?.startsWith("/destinations") ? "text-film-amber font-bold" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <span>Spatial Index</span>
              {pathname?.startsWith("/destinations") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-film-amber rounded-full" />
              )}
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`relative py-1 transition-colors duration-300 ${
                  pathname?.startsWith("/admin") ? "text-film-amber font-bold" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                <span>Dashboard</span>
                {pathname?.startsWith("/admin") && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-film-amber rounded-full" />
                )}
              </Link>
            )}

            <Link
              href="/about"
              className={`relative py-1 transition-colors duration-300 ${
                pathname === "/about" ? "text-film-amber font-bold" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <span>About</span>
              {pathname === "/about" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-film-amber rounded-full" />
              )}
            </Link>
          </nav>

          <div className="h-6 w-px bg-foreground/15 hidden sm:block" />

          {/* Aperture Theme Toggle */}
          <ApertureToggle />

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 rounded-full border border-foreground/15 bg-background/80 text-foreground hover:border-film-amber transition-colors cursor-pointer"
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
                  ? "border-film-amber/50 bg-film-amber/10 text-film-amber font-bold"
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
                  ? "border-film-amber/50 bg-film-amber/10 text-film-amber font-bold"
                  : "border-foreground/10 text-foreground/80 hover:bg-foreground/5"
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Spatial Index</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-3 py-3 px-4 rounded-xl border transition-all ${
                  pathname?.startsWith("/admin")
                    ? "border-film-amber/50 bg-film-amber/10 text-film-amber font-bold"
                    : "border-foreground/10 text-foreground/80 hover:bg-foreground/5"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}

            <Link
              href="/about"
              className={`flex items-center gap-3 py-3 px-4 rounded-xl border transition-all ${
                pathname === "/about"
                  ? "border-film-amber/50 bg-film-amber/10 text-film-amber font-bold"
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
