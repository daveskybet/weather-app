export type WeatherCondition =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'snowy'
  | 'windy'
  | 'stormy';

export interface DailyForecast {
  date: string; // ISO date e.g. "2024-01-15"
  condition: WeatherCondition;
  description: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
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
