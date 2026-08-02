/**
 * OpenStreetMap Nominatim Geocoding Utility
 * Automatically resolves geographic names into exact latitude & longitude coordinates.
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export interface GeocodeSuggestion {
  displayName: string;
  name: string;
  country?: string;
  state?: string;
  county?: string;
  city?: string;
  type: string;
  lat: number;
  lng: number;
}

export async function geocodeLocation(
  name: string,
  parentContext?: string
): Promise<GeocodeResult | null> {
  if (!name || name.trim().length === 0) return null;

  try {
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

/**
 * Searches OpenStreetMap Nominatim for multiple geographic location suggestions.
 * Returns country, state, city, and GPS coordinates for disambiguation.
 */
export async function searchLocationSuggestions(
  query: string
): Promise<GeocodeSuggestion[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query.trim()
    )}&format=json&limit=5&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "PhotographyPortfolioApp/1.0 (daniel-garcia-portfolio)",
        "Accept-Language": "en,es",
      },
    });

    if (!res.ok) return [];

    const results = await res.json();
    if (!Array.isArray(results)) return [];

    const suggestions: GeocodeSuggestion[] = [];

    for (const item of results) {
      const address = item.address || {};
      const name =
        address.city ||
        address.town ||
        address.village ||
        address.hamlet ||
        address.county ||
        address.state ||
        address.country ||
        item.name ||
        query;

      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);

      if (!isNaN(lat) && !isNaN(lng)) {
        suggestions.push({
          displayName: item.display_name,
          name,
          country: address.country,
          state: address.state || address.county || address.region,
          county: address.county,
          city: address.city || address.town || address.village,
          type: item.type || item.class || "spot",
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
        });
      }
    }

    return suggestions;
  } catch (err) {
    console.error("Error fetching location suggestions:", err);
    return [];
  }
}
