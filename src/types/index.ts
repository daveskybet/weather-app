export type WeatherCondition =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'snowy'
  | 'windy'
  | 'stormy';

export interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: WeatherCondition;
  description: string;
  windSpeed: number;
  updatedAt: Date;
}

export interface WeatherState {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}
