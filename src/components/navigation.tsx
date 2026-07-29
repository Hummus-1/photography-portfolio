"use client";

import Link from "next/link";
import { ApertureToggle } from "./aperture-toggle";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function Navigation() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-lg transition-colors duration-300">
      <div className="w-full px-6 md:px-12 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 font-serif text-xl md:text-2xl font-bold tracking-wider hover:opacity-85 transition-opacity"
        >
          <span>DANIEL GARCÍA</span>
          <span className="text-[10px] tracking-widest font-sans font-normal opacity-40 relative -top-2">©</span>
        </Link>

        {/* Links & Aperture Switcher */}
        <div className="flex items-center gap-8">
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
        </div>
      </div>
    </header>
  );
}
