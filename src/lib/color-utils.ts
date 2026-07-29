/**
 * Utility functions for smart palette color analysis and accent color selection.
 */

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
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

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
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

/**
 * Evaluates an album's color palette and selects the punchiest, most vibrant accent color
 * that stands out and looks fantastic against the current background theme.
 */
export function selectBestAccentColor(
  palette?: string[] | null,
  fallback: string = "#d96b27"
): string {
  if (!palette || palette.length === 0) return fallback;

  // Clean and filter valid hex strings
  const validHexes = palette.filter((c) => typeof c === "string" && /^#?[0-9A-Fa-f]{3,6}$/.test(c));
  if (validHexes.length === 0) return fallback;

  const analyzed = validHexes.map((hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return { hex, h: 0, s: 0, l: 0, score: 0 };
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Score calculation: prioritize high saturation, penalize extreme darks (<15%) & extreme lights (>85%)
    let score = s * 2; // Saturation is primary driver of "punchiness"

    // Bonus for warm & vivid photo hues (amber, gold, crimson, teal, orange)
    if ((h >= 10 && h <= 50) || (h >= 160 && h <= 210)) {
      score += 25;
    }

    // Penalty for near-monochrome (grays/blacks/whites)
    if (s < 15) {
      score -= 80;
    }

    // Penalty for extreme lightness values that washed out in themes
    if (l < 15 || l > 85) {
      score -= 40;
    }

    return { hex, h, s, l, score };
  });

  // Sort descending by punchiness score
  analyzed.sort((a, b) => b.score - a.score);

  // Pick top candidate if its score is reasonable, otherwise fallback
  const best = analyzed[0];
  if (best && best.s >= 10) {
    return best.hex.startsWith("#") ? best.hex : `#${best.hex}`;
  }

  return fallback;
}
