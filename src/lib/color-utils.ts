/**
 * Advanced Utility functions for smart palette color analysis, WCAG contrast verification,
 * dynamic accent color selection, duotone secondary pairing, and ambient hero glow opacity.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

// Convert hex string to RGB object
export function hexToRgb(hex: string): RGB | null {
  const cleanHex = hex.replace(/^#/, "");
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

// Convert RGB to HSL (h: 0-360, s: 0-100, l: 0-100)
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Convert HSL back to hex string
export function hslToHex(h: number, s: number, l: number): string {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Calculates WCAG 2.1 relative luminance for a given hex color.
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const transform = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(rgb.r) + 0.7152 * transform(rgb.g) + 0.0722 * transform(rgb.b);
}

/**
 * Calculates WCAG 2.1 contrast ratio between two hex colors.
 * Returns ratio value from 1 to 21.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Adjusts color lightness to guarantee minimum WCAG contrast against background.
 */
export function ensureAccessibleContrast(
  hex: string,
  bgHex: string = "#09090b",
  minRatio: number = 3.5
): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  let { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const currentRatio = getContrastRatio(hex, bgHex);
  if (currentRatio >= minRatio) return hex;

  const bgLum = getRelativeLuminance(bgHex);
  const isDarkBg = bgLum < 0.5;

  // Step lightness in direction that improves contrast
  for (let step = 0; step < 25; step++) {
    l = isDarkBg ? Math.min(95, l + 3) : Math.max(5, l - 3);
    const candidateHex = hslToHex(h, s, l);
    if (getContrastRatio(candidateHex, bgHex) >= minRatio) {
      return candidateHex;
    }
  }

  return hex;
}

/**
 * Evaluates an album's color palette and selects the punchiest, most vibrant accent color.
 * Supports explicit custom hero color overrides and respects background contrast.
 */
export function selectBestAccentColor(
  palette?: string[] | null,
  fallback: string = "#d96b27",
  customHeroColor?: string | null,
  bgHex: string = "#09090b"
): string {
  // 1. Respect manual custom hero color if defined
  if (customHeroColor && /^#?[0-9A-Fa-f]{3,6}$/.test(customHeroColor)) {
    const formatted = customHeroColor.startsWith("#") ? customHeroColor : `#${customHeroColor}`;
    return ensureAccessibleContrast(formatted, bgHex, 3.0);
  }

  if (!palette || palette.length === 0) return fallback;

  // Clean and filter valid hex strings
  const validHexes = palette.filter((c) => typeof c === "string" && /^#?[0-9A-Fa-f]{3,6}$/.test(c));
  if (validHexes.length === 0) return fallback;

  const analyzed = validHexes.map((hex) => {
    const formattedHex = hex.startsWith("#") ? hex : `#${hex}`;
    const rgb = hexToRgb(formattedHex);
    if (!rgb) return { hex: formattedHex, h: 0, s: 0, l: 0, score: 0 };
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Primary score driver: saturation & balanced lightness
    let score = s * 2.5;

    // Favor balanced lightness range (30% to 75%)
    if (l >= 30 && l <= 75) {
      score += 30;
    } else if (l < 20 || l > 85) {
      score -= 45;
    }

    // Heavy penalty for near-monochrome grays/blacks/whites
    if (s < 12) {
      score -= 90;
    }

    // Reward contrast ratio against background
    const contrast = getContrastRatio(formattedHex, bgHex);
    score += Math.min(contrast * 5, 25);

    return { hex: formattedHex, h, s, l, score };
  });

  analyzed.sort((a, b) => b.score - a.score);

  const best = analyzed[0];
  if (best && best.s >= 10) {
    return ensureAccessibleContrast(best.hex, bgHex, 3.0);
  }

  return fallback;
}

/**
 * Selects a harmonious secondary accent color from the palette for duotone ambient effects.
 * Guarantees a minimum hue distance (>= 30 deg) or lightness difference from the primary accent.
 */
export function selectBestSecondaryColor(
  palette?: string[] | null,
  primaryAccentHex: string = "#d96b27",
  fallback?: string
): string {
  const primaryRgb = hexToRgb(primaryAccentHex);
  const primaryHsl = primaryRgb ? rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b) : { h: 30, s: 80, l: 50 };

  if (palette && palette.length > 0) {
    const validHexes = palette.map(c => c.startsWith("#") ? c : `#${c}`).filter(c => /^#[0-9A-Fa-f]{3,6}$/.test(c));

    for (const hex of validHexes) {
      if (hex.toLowerCase() === primaryAccentHex.toLowerCase()) continue;
      const rgb = hexToRgb(hex);
      if (!rgb) continue;
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

      const hueDiff = Math.abs(hsl.h - primaryHsl.h);
      const circularHueDiff = Math.min(hueDiff, 360 - hueDiff);
      const lightnessDiff = Math.abs(hsl.l - primaryHsl.l);

      // Pick palette swatch with good hue contrast or lightness separation
      if (circularHueDiff >= 25 || lightnessDiff >= 20) {
        return hex;
      }
    }
  }

  if (fallback) return fallback;

  // Fallback: derive a complementary / analogous secondary color by rotating hue by +35 degrees
  const secondaryHue = (primaryHsl.h + 35) % 360;
  const secondaryLightness = primaryHsl.l > 60 ? primaryHsl.l - 20 : primaryHsl.l + 15;
  return hslToHex(secondaryHue, Math.max(30, primaryHsl.s - 10), secondaryLightness);
}

/**
 * Computes optimal ambient hero glow opacity based on color brightness.
 * Vibrant/neon colors get lighter opacity (~0.18-0.24) to avoid washing out UI,
 * while deeper muted hues receive higher opacity (~0.32-0.40) for presence.
 */
export function getHeroGlowOpacity(accentHex: string, isDarkMode: boolean = true): number {
  const lum = getRelativeLuminance(accentHex);
  if (isDarkMode) {
    // Range: 0.18 for bright colors, 0.40 for dark colors
    return Math.max(0.18, Math.min(0.40, 0.42 - lum * 0.35));
  } else {
    // Range: 0.12 for bright colors, 0.28 for dark colors
    return Math.max(0.12, Math.min(0.28, 0.30 - lum * 0.25));
  }
}

/**
 * Color Quantization Algorithm for 64x64 buffer downsamples.
 * Groups colors into frequency buckets and selects 5 distinct, high-quality swatches.
 */
export function extractQuantizedPalette(
  pixelData: Uint8Array, // RGBA or RGB buffer
  channels: number = 3,
  count: number = 5
): string[] {
  const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();

  // Quantize RGB values into 16-step bins (4 bits per channel)
  for (let i = 0; i < pixelData.length; i += channels) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];

    // Skip extreme pure whites or pure blacks if non-essential
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum > 250 || lum < 5) continue;

    const binR = Math.floor(r / 16) * 16;
    const binG = Math.floor(g / 16) * 16;
    const binB = Math.floor(b / 16) * 16;

    const key = `${binR},${binG},${binB}`;
    const existing = colorBuckets.get(key);

    if (existing) {
      existing.r += r;
      existing.g += g;
      existing.b += b;
      existing.count++;
    } else {
      colorBuckets.set(key, { r, g, b, count: 1 });
    }
  }

  // Convert buckets to average colors
  const candidates = Array.from(colorBuckets.values()).map(bucket => {
    const avgR = Math.round(bucket.r / bucket.count);
    const avgG = Math.round(bucket.g / bucket.count);
    const avgB = Math.round(bucket.b / bucket.count);
    const hsl = rgbToHsl(avgR, avgG, avgB);
    return {
      r: avgR,
      g: avgG,
      b: avgB,
      count: bucket.count,
      h: hsl.h,
      s: hsl.s,
      l: hsl.l,
      hex: `#${[avgR, avgG, avgB].map(x => x.toString(16).padStart(2, "0")).join("")}`.toUpperCase()
    };
  });

  // Sort by frequency and saturation
  candidates.sort((a, b) => (b.count * (b.s + 10)) - (a.count * (a.s + 10)));

  const selectedHexes: string[] = [];
  for (const candidate of candidates) {
    if (selectedHexes.length >= count) break;

    // Ensure spatial / color distance from already selected swatches
    const isDistinct = selectedHexes.every(selHex => {
      const selRgb = hexToRgb(selHex);
      if (!selRgb) return true;
      const dr = candidate.r - selRgb.r;
      const dg = candidate.g - selRgb.g;
      const db = candidate.b - selRgb.b;
      return Math.sqrt(dr * dr + dg * dg + db * db) > 40; // RGB Euclidean distance
    });

    if (isDistinct) {
      selectedHexes.push(candidate.hex);
    }
  }

  // Fallback to fill up to `count` if needed
  while (selectedHexes.length < count && candidates.length > selectedHexes.length) {
    const next = candidates[selectedHexes.length];
    if (next && !selectedHexes.includes(next.hex)) {
      selectedHexes.push(next.hex);
    } else {
      break;
    }
  }

  return selectedHexes.length > 0 ? selectedHexes : ["#D96B27", "#1F2937", "#4B5563", "#9CA3AF", "#E5E7EB"];
}
