import { useCallback, useEffect, useState } from 'react';
import { WeatherService } from '@/services/weatherService';
import { WeatherData, WeatherState } from '@/types';

const DEFAULT_CITY = 'Sheffield';

interface UseWeatherResult extends WeatherState {
  refresh: () => void;
  setCity: (city: string) => void;
  city: string;
}

export function useWeather(
  service: WeatherService,
  initialCity: string = DEFAULT_CITY
): UseWeatherResult {
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState<WeatherState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetch = useCallback(
    async (targetCity: string) => {
      setState({ data: null, isLoading: true, error: null });
      try {
        const data: WeatherData = await service.fetchWeather(targetCity);
        setState({ data, isLoading: false, error: null });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch weather';
        setState({ data: null, isLoading: false, error: message });
      }
    },
    [service]
  );

  useEffect(() => {
    fetch(city);
  }, [city, fetch]);

  const refresh = useCallback(() => {
    fetch(city);
  }, [city, fetch]);

  return { ...state, refresh, setCity, city };
}
