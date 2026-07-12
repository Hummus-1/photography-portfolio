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
    <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/70 backdrop-blur-md transition-colors duration-400">
      <div className="w-full px-6 md:px-12 h-20 flex items-center justify-between">
        {/* Logo / Brand Name */}
        <Link
          href="/"
          className="font-serif text-xl md:text-2xl font-bold tracking-wider hover:opacity-75 transition-opacity duration-300"
        >
          STILLS <span className="text-[10px] tracking-widest font-sans font-normal opacity-50 relative -top-3">©</span>
        </Link>

        {/* Links & Theme Switcher */}
        <div className="flex items-center gap-8">
          <nav className="hidden sm:flex items-center gap-8 text-xs font-mono tracking-widest uppercase">
            <Link
              href="/"
              className={`hover:opacity-100 transition-opacity duration-300 ${
                pathname === "/" ? "opacity-100 font-bold" : "opacity-60"
              }`}
            >
              Gallery
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`hover:opacity-100 transition-opacity duration-300 ${
                  pathname?.startsWith("/admin") ? "opacity-100 font-bold" : "opacity-60"
                }`}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/about"
              className={`hover:opacity-100 transition-opacity duration-300 ${
                pathname === "/about" ? "opacity-100 font-bold" : "opacity-60"
              }`}
            >
              About
            </Link>
          </nav>

          <div className="h-6 w-px bg-foreground/15 hidden sm:block" />

          {/* Theme Toggle */}
          <ApertureToggle />
        </div>
      </div>
    </header>
  );
}
