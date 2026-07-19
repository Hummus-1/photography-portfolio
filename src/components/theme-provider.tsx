"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const context = useNextTheme();

  const activeTheme = (context.resolvedTheme || context.theme || "dark") as "light" | "dark";

  const toggleTheme = React.useCallback(() => {
    const currentTheme = context.resolvedTheme || context.theme || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    context.setTheme(nextTheme);
  }, [context]);

  return {
    ...context,
    theme: activeTheme,
    toggleTheme,
  };
}


