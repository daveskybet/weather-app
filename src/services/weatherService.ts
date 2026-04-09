import { DailyForecast, HourlyForecast, WeatherData } from '@/types';
import { wmoCondition, wmoDescription } from '@/utils/wmo';

export interface WeatherService {
  fetchWeather: (city: string) => Promise<WeatherData>;
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
  hourly: {
    time: string[]; // "2024-01-01T14:00"
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
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

    // Step 2: Fetch current conditions + 7-day daily + hourly breakdown
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
    forecastUrl.searchParams.set(
      'hourly',
      'temperature_2m,weather_code,precipitation_probability'
    );
    forecastUrl.searchParams.set('wind_speed_unit', 'kmh');
    forecastUrl.searchParams.set('timezone', 'auto');
    forecastUrl.searchParams.set('forecast_days', '7');

    const forecastRes = await fetch(forecastUrl.toString());
    if (!forecastRes.ok) {
      throw new Error(`Forecast request failed: ${forecastRes.status}`);
    }
    const forecastData = (await forecastRes.json()) as ForecastResponse;

    const { current, daily, hourly } = forecastData;

    // Group hourly entries by date
    const hourlyByDate: Record<string, HourlyForecast[]> = {};
    for (let i = 0; i < hourly.time.length; i++) {
      const timeStr = hourly.time[i]; // "2024-01-01T14:00"
      const date = timeStr.slice(0, 10); // "2024-01-01"
      const time = timeStr.slice(11);    // "14:00"
      if (!hourlyByDate[date]) hourlyByDate[date] = [];
      hourlyByDate[date].push({
        time,
        temperature: Math.round(hourly.temperature_2m[i]),
        condition: wmoCondition(hourly.weather_code[i]),
        precipitationProbability: hourly.precipitation_probability[i],
      });
    }

    const forecast: DailyForecast[] = daily.time.map((date, i) => ({
      date,
      condition: wmoCondition(daily.weather_code[i]),
      description: wmoDescription(daily.weather_code[i]),
      tempMax: Math.round(daily.temperature_2m_max[i]),
      tempMin: Math.round(daily.temperature_2m_min[i]),
      precipitationProbability: daily.precipitation_probability_max[i],
      hourly: hourlyByDate[date] ?? [],
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
