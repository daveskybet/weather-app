import { DailyForecast, HourlyForecast, WeatherData } from '@/types';
import { wmoCondition, wmoDescription } from '@/utils/wmo';
import { GeoLocation } from '@/services/geocodingService';

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

export async function fetchForecast(location: GeoLocation): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code'
  );
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
  );
  url.searchParams.set(
    'hourly',
    'temperature_2m,weather_code,precipitation_probability'
  );
  url.searchParams.set('wind_speed_unit', 'kmh');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Forecast request failed: ${res.status}`);
  }
  const data = (await res.json()) as ForecastResponse;
  const { current, daily, hourly } = data;

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
    city: location.name,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    condition: wmoCondition(current.weather_code),
    description: wmoDescription(current.weather_code),
    windSpeed: Math.round(current.wind_speed_10m),
    updatedAt: new Date(),
    forecast,
  };
}
