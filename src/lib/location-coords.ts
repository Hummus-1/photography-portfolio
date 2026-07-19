import { LocationNode } from "./types";

export interface GeoLocation {
  lat: number;
  lng: number;
  countryCode: string;
}

// Fallback coordinate lookup for common countries, islands, and regions
export const LOCATION_COORDINATES_MAP: { [key: string]: GeoLocation } = {
  // Spain & Canary Islands
  spain: { lat: 40.4637, lng: -3.7492, countryCode: "ES" },
  "canary islands": { lat: 28.2915, lng: -16.6291, countryCode: "ES" },
  tenerife: { lat: 28.2915, lng: -16.6291, countryCode: "ES" },
  anaga: { lat: 28.5367, lng: -16.2025, countryCode: "ES" },
  "gran canaria": { lat: 27.9202, lng: -15.5474, countryCode: "ES" },
  madrid: { lat: 40.4168, lng: -3.7038, countryCode: "ES" },
  barcelona: { lat: 41.3851, lng: 2.1734, countryCode: "ES" },

  // Iceland
  iceland: { lat: 64.9631, lng: -19.0208, countryCode: "IS" },
  skógafoss: { lat: 63.5321, lng: -19.5114, countryCode: "IS" },
  vik: { lat: 63.4194, lng: -19.006, countryCode: "IS" },
  reykjavik: { lat: 64.1466, lng: -21.9426, countryCode: "IS" },

  // Greenland
  greenland: { lat: 71.7069, lng: -42.6043, countryCode: "GL" },
  "disko bay": { lat: 69.22, lng: -51.10, countryCode: "GL" },
  ilulissat: { lat: 69.2167, lng: -51.1, countryCode: "GL" },
  nuuk: { lat: 64.1836, lng: -51.7214, countryCode: "GL" },

  // Mongolia
  mongolia: { lat: 46.8625, lng: 103.8467, countryCode: "MN" },
  "altai mountains": { lat: 48.0167, lng: 89.0667, countryCode: "MN" },
  "bayan-ölgii": { lat: 48.0167, lng: 89.0667, countryCode: "MN" },
  ulaanbaatar: { lat: 47.8864, lng: 106.9057, countryCode: "MN" },

  // Japan
  japan: { lat: 36.2048, lng: 138.2529, countryCode: "JP" },
  tokyo: { lat: 35.6762, lng: 139.6503, countryCode: "JP" },
  kyoto: { lat: 35.0116, lng: 135.7681, countryCode: "JP" },

  // United States
  "united states": { lat: 37.0902, lng: -95.7129, countryCode: "US" },
  usa: { lat: 37.0902, lng: -95.7129, countryCode: "US" },
  california: { lat: 36.7783, lng: -119.4179, countryCode: "US" },

  // Norway
  norway: { lat: 60.472, lng: 8.4689, countryCode: "NO" },
  lofoten: { lat: 68.2343, lng: 14.5682, countryCode: "NO" },
};

export function resolveCoordinates(
  lat?: number,
  lng?: number,
  location_path?: LocationNode[],
  location_str?: string | null
): GeoLocation {
  if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng)) {
    const countryNode = location_path?.find((n) => n.type === "country");
    return {
      lat,
      lng,
      countryCode: countryNode?.iso_code || "WORLD",
    };
  }

  // Check location_path items
  if (location_path && location_path.length > 0) {
    for (const node of [...location_path].reverse()) {
      const key = node.name.toLowerCase().trim();
      if (LOCATION_COORDINATES_MAP[key]) {
        return LOCATION_COORDINATES_MAP[key];
      }
    }
  }

  // Check flat location string
  if (location_str) {
    const parts = location_str.split(",").map((p) => p.toLowerCase().trim());
    for (const part of parts.reverse()) {
      if (LOCATION_COORDINATES_MAP[part]) {
        return LOCATION_COORDINATES_MAP[part];
      }
    }
  }

  // Default fallback (Europe center)
  return { lat: 48.8566, lng: 2.3522, countryCode: "EU" };
}
