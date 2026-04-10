import { useCallback, useState } from 'react';
import useSWR from 'swr';
import { fetchCoordinates } from '@/services/geocodingService';
import { fetchForecast } from '@/services/forecastService';
import { WeatherData } from '@/types';

const DEFAULT_CITY = 'Sheffield';

interface UseWeatherResult {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  city: string;
  setCity: (city: string) => void;
  refresh: () => void;
}

export function useWeather(initialCity: string = DEFAULT_CITY): UseWeatherResult {
  const [city, setCity] = useState(initialCity);

  const {
    data: location,
    error: geoError,
    isLoading: geoLoading,
  } = useSWR(city, fetchCoordinates);

  const {
    data,
    error: forecastError,
    isLoading: forecastLoading,
    mutate,
  } = useSWR(
    // Key includes the location name so a new city always triggers a fresh fetch,
    // even if coords happen to be identical (e.g. in tests).
    location ?? null,
    fetchForecast
  );

  const isLoading = geoLoading || forecastLoading;
  const rawError = geoError ?? forecastError;
  const error =
    rawError instanceof Error ? rawError.message : null;

  const refresh = useCallback(() => {
    void mutate();
  }, [mutate]);

  return {
    data: data ?? null,
    isLoading,
    error,
    city,
    setCity,
  refresh,
  };
}
