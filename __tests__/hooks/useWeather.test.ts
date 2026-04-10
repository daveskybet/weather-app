import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { SWRConfig } from 'swr';
import { useWeather } from '@/hooks/useWeather';
import * as geocodingService from '@/services/geocodingService';
import * as forecastService from '@/services/forecastService';
import { GeoLocation } from '@/services/geocodingService';
import { WeatherData } from '@/types';

const mockLocation: GeoLocation = {
  name: 'London',
  latitude: 51.5085,
  longitude: -0.1257,
};

const mockWeatherData: WeatherData = {
  city: 'London',
  temperature: 12,
  feelsLike: 10,
  humidity: 80,
  condition: 'rainy',
  description: 'Light rain',
  windSpeed: 20,
  updatedAt: new Date('2024-01-01'),
  forecast: [],
};

jest.mock('@/services/geocodingService');
jest.mock('@/services/forecastService');

const mockFetchCoordinates = jest.mocked(geocodingService.fetchCoordinates);
const mockFetchForecast = jest.mocked(forecastService.fetchForecast);

// Fresh SWR cache per test: no cross-test cache bleed, no deduplication, no retries.
function createWrapper() {
  return function SwrWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(SWRConfig, {
      value: { provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false },
    }, children);
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchCoordinates.mockResolvedValue(mockLocation);
  mockFetchForecast.mockResolvedValue(mockWeatherData);
});

describe('useWeather', () => {
  it('starts with loading state and no data', async () => {
    const { result } = renderHook(() => useWeather('London'), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    // Drain pending state to avoid act() warnings on teardown
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('populates data after both fetches resolve', async () => {
    const { result } = renderHook(() => useWeather('London'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.error).toBeNull();
    expect(mockFetchCoordinates).toHaveBeenCalledWith('London');
    expect(mockFetchForecast).toHaveBeenCalledWith(mockLocation);
  });

  it('sets error when geocoding fails', async () => {
    mockFetchCoordinates.mockRejectedValue(new Error('City not found'));
    const { result } = renderHook(() => useWeather('Atlantis'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('City not found');
  });

  it('sets error when forecast fetch fails', async () => {
    mockFetchForecast.mockRejectedValue(new Error('Forecast unavailable'));
    const { result } = renderHook(() => useWeather('London'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Forecast unavailable');
  });

  it('re-fetches when setCity is called', async () => {
    const newLocation: GeoLocation = { name: 'Paris', latitude: 48.85, longitude: 2.35 };
    const newData: WeatherData = { ...mockWeatherData, city: 'Paris' };
    mockFetchCoordinates
      .mockResolvedValueOnce(mockLocation)
      .mockResolvedValueOnce(newLocation);
    mockFetchForecast
      .mockResolvedValueOnce(mockWeatherData)
      .mockResolvedValueOnce(newData);

    const { result } = renderHook(() => useWeather('London'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data?.city).toBe('London'));

    act(() => { result.current.setCity('Paris'); });

    await waitFor(() => expect(result.current.data?.city).toBe('Paris'));
    expect(result.current.city).toBe('Paris');
    expect(mockFetchCoordinates).toHaveBeenCalledWith('Paris');
  });

  it('uses default city "Sheffield" when none provided', async () => {
    const { result } = renderHook(() => useWeather(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetchCoordinates).toHaveBeenCalledWith('Sheffield');
  });

  it('exposes the current city', async () => {
    const { result } = renderHook(() => useWeather('Tokyo'), { wrapper: createWrapper() });
    expect(result.current.city).toBe('Tokyo');
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
