export type WeatherCondition =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'snowy'
  | 'windy'
  | 'stormy';

export interface HourlyForecast {
  time: string; // "HH:00" e.g. "06:00", "14:00"
  temperature: number;
  condition: WeatherCondition;
  precipitationProbability: number;
}

export interface DailyForecast {
  date: string; // ISO date e.g. "2024-01-15"
  condition: WeatherCondition;
  description: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  hourly: HourlyForecast[];
}

export interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: WeatherCondition;
  description: string;
  windSpeed: number;
  updatedAt: Date;
  forecast: DailyForecast[];
}

export interface WeatherState {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}
