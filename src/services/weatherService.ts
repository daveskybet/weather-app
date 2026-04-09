import { DailyForecast, WeatherCondition, WeatherData } from '@/types';

export interface WeatherService {
  fetchWeather: (city: string) => Promise<WeatherData>;
}

// WMO Weather Interpretation Codes → app condition
const WMO_CONDITION: Record<number, WeatherCondition> = {
  0: 'sunny',
  1: 'sunny',
  2: 'cloudy',
  3: 'cloudy',
  45: 'cloudy',
  48: 'cloudy',
  51: 'rainy',
  53: 'rainy',
  55: 'rainy',
  61: 'rainy',
  63: 'rainy',
  65: 'rainy',
  71: 'snowy',
  73: 'snowy',
  75: 'snowy',
  77: 'snowy',
  80: 'rainy',
  81: 'rainy',
  82: 'rainy',
  85: 'snowy',
  86: 'snowy',
  95: 'stormy',
  96: 'stormy',
  99: 'stormy',
};

const WMO_DESCRIPTION: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Heavy drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

function wmoCondition(code: number): WeatherCondition {
  return WMO_CONDITION[code] ?? 'cloudy';
}

function wmoDescription(code: number): string {
  return WMO_DESCRIPTION[code] ?? 'Unknown conditions';
}

interface GeocodingResult {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
  }>;
}

interface ForecastResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
}

export const weatherService: WeatherService = {
  fetchWeather: async (city: string): Promise<WeatherData> => {
    // Step 1: Geocode city name → lat/lng
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) {
      throw new Error(`Geocoding request failed: ${geoRes.status}`);
    }
    const geoData = (await geoRes.json()) as GeocodingResult;
    if (!geoData.results?.length) {
      throw new Error(`City not found: ${city}`);
    }
    const { name, latitude, longitude } = geoData.results[0];

    // Step 2: Fetch current conditions + 7-day forecast
    const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
    forecastUrl.searchParams.set('latitude', String(latitude));
    forecastUrl.searchParams.set('longitude', String(longitude));
    forecastUrl.searchParams.set(
      'current',
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code'
    );
    forecastUrl.searchParams.set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
    );
    forecastUrl.searchParams.set('wind_speed_unit', 'kmh');
    forecastUrl.searchParams.set('timezone', 'auto');
    forecastUrl.searchParams.set('forecast_days', '7');

    const forecastRes = await fetch(forecastUrl.toString());
    if (!forecastRes.ok) {
      throw new Error(`Forecast request failed: ${forecastRes.status}`);
    }
    const forecastData = (await forecastRes.json()) as ForecastResponse;

    const { current, daily } = forecastData;

    const forecast: DailyForecast[] = daily.time.map((date, i) => ({
      date,
      condition: wmoCondition(daily.weather_code[i]),
      description: wmoDescription(daily.weather_code[i]),
      tempMax: Math.round(daily.temperature_2m_max[i]),
      tempMin: Math.round(daily.temperature_2m_min[i]),
      precipitationProbability: daily.precipitation_probability_max[i],
    }));

    return {
      city: name,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      condition: wmoCondition(current.weather_code),
      description: wmoDescription(current.weather_code),
      windSpeed: Math.round(current.wind_speed_10m),
      updatedAt: new Date(),
      forecast,
    };
  },
};
