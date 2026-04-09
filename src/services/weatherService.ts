import { WeatherData } from '@/types';

export interface WeatherService {
  fetchWeather: (city: string) => Promise<WeatherData>;
}

const MOCK_DELAY_MS = 800;

const mockWeatherData: Record<string, WeatherData> = {
  default: {
    city: 'Sheffield',
    temperature: 18,
    feelsLike: 16,
    humidity: 72,
    condition: 'cloudy',
    description: 'Partly cloudy with a chance of fog',
    windSpeed: 14,
    updatedAt: new Date(),
  },
};

export const weatherService: WeatherService = {
  fetchWeather: (city: string): Promise<WeatherData> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalised = city.trim().toLowerCase();
        if (normalised === 'error') {
          reject(new Error('City not found'));
          return;
        }
        const data = mockWeatherData[normalised] ?? {
          ...mockWeatherData.default,
          city: city.trim() || 'Sheffield',
          updatedAt: new Date(),
        };
        resolve(data);
      }, MOCK_DELAY_MS);
    });
  },
};
