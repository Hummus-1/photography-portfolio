/**
 * OpenStreetMap Nominatim Geocoding Utility
 * Automatically resolves geographic names into exact latitude & longitude coordinates.
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeLocation(
  name: string,
  parentContext?: string
): Promise<GeocodeResult | null> {
  if (!name || name.trim().length === 0) return null;

  try {
    // Construct search query string (e.g. "Disko Bay, Greenland" or "Skógafoss, Iceland")
    const cleanName = name.trim();
    const cleanContext = parentContext ? parentContext.trim() : "";
    
    const query = cleanContext && !cleanName.toLowerCase().includes(cleanContext.toLowerCase())
      ? `${cleanName}, ${cleanContext}`
      : cleanName;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=1&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "PhotographyPortfolioApp/1.0 (daniel-garcia-portfolio)",
        "Accept-Language": "en,es",
      },
    });

    if (!res.ok) {
      console.warn(`Geocoding request failed with status ${res.status}`);
      return null;
    }

    const results = await res.json();
    if (!results || results.length === 0) {
      // Fallback: try searching only by primary location name if query with context yielded no hits
      if (cleanContext) {
        return geocodeLocation(cleanName);
      }
      return null;
    }

    const first = results[0];
    const lat = parseFloat(first.lat);
    const lng = parseFloat(first.lon);

    if (isNaN(lat) || isNaN(lng)) return null;

    return {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      displayName: first.display_name,
    };
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}
