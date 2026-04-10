export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
  }>;
}

const MAX_CITY_LENGTH = 100;

// Control characters: anything in the C0/C1 ranges (0x00–0x1F and 0x7F–0x9F)
const CONTROL_CHAR_RE = /[\x00-\x1F\x7F-\x9F]/;

// Letters (any script/language), combining marks, digits, plain spaces, hyphens,
// apostrophes, periods, commas — covers all real city names worldwide.
const VALID_CITY_RE = /^[\p{L}\p{M}\d '\-.,]+$/u;

export function sanitiseCity(city: string): string {
  if (CONTROL_CHAR_RE.test(city)) {
    throw new Error('City name contains invalid characters');
  }
  // Trim edges and collapse internal whitespace runs to a single space
  const trimmed = city.trim().replace(/[ \t]+/g, ' ');
  if (trimmed.length === 0) {
    throw new Error('City name must not be empty');
  }
  if (trimmed.length > MAX_CITY_LENGTH) {
    throw new Error(`City name must not exceed ${MAX_CITY_LENGTH} characters`);
  }
  if (!VALID_CITY_RE.test(trimmed)) {
    throw new Error('City name contains invalid characters');
  }
  return trimmed;
}

export async function fetchCoordinates(city: string): Promise<GeoLocation> {
  const sanitised = sanitiseCity(city);

  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(sanitised)}&count=1&language=en&format=json`
  );
  if (!res.ok) {
    throw new Error(`Geocoding request failed: ${res.status}`);
  }
  const data = (await res.json()) as GeocodingResponse;
  if (!data.results?.length) {
    throw new Error(`City not found: ${sanitised}`);
  }
  const { name, latitude, longitude } = data.results[0];
  return { name, latitude, longitude };
}
