import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { SWRConfig } from 'swr';
import { HomeScreen } from '@/screens/HomeScreen';
import * as geocodingService from '@/services/geocodingService';
import * as forecastService from '@/services/forecastService';
import { GeoLocation } from '@/services/geocodingService';
import { WeatherData } from '@/types';

const mockLocation: GeoLocation = {
  name: 'Sheffield',
  latitude: 53.383,
  longitude: -1.4659,
};

const mockWeatherData: WeatherData = {
  city: 'Sheffield',
  temperature: 18,
  feelsLike: 16,
  humidity: 72,
  condition: 'cloudy',
  description: 'Partly cloudy with a chance of fog',
  windSpeed: 14,
  updatedAt: new Date('2024-01-01'),
  forecast: [],
};

jest.mock('@/services/geocodingService');
jest.mock('@/services/forecastService');

const mockFetchCoordinates = jest.mocked(geocodingService.fetchCoordinates);
const mockFetchForecast = jest.mocked(forecastService.fetchForecast);

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockFetchCoordinates.mockResolvedValue(mockLocation);
  mockFetchForecast.mockResolvedValue(mockWeatherData);
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
});

// Fresh SWR cache per test: no cross-test cache bleed, no deduplication, no retries,
// no focus/reconnect listeners. Fake timers prevent SWR's internal setTimeout calls
// from keeping the Jest worker process alive after the test finishes.
function renderHomeScreen() {
  return render(
    <SWRConfig value={{
      provider: () => new Map(),
      dedupingInterval: 0,
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }}>
      <HomeScreen />
    </SWRConfig>
  );
}

describe('HomeScreen', () => {
  it('shows a loading spinner on mount', async () => {
    renderHomeScreen();
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).toBeNull());
  });

  it('shows weather data after loading resolves', async () => {
    renderHomeScreen();
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).toBeNull());
    expect(screen.getByTestId('weather-card')).toBeTruthy();
    expect(screen.getByTestId('weather-city')).toHaveTextContent('Sheffield');
  });

  it('shows an error message when geocoding fails', async () => {
    mockFetchCoordinates.mockRejectedValue(new Error('Service unavailable'));
    renderHomeScreen();
    await waitFor(() => expect(screen.getByTestId('error-message')).toBeTruthy());
    expect(screen.getByTestId('error-text')).toHaveTextContent('Service unavailable');
  });

  it('shows an error message when the forecast fetch fails', async () => {
    mockFetchForecast.mockRejectedValue(new Error('Forecast unavailable'));
    renderHomeScreen();
    await waitFor(() => expect(screen.getByTestId('error-message')).toBeTruthy());
    expect(screen.getByTestId('error-text')).toHaveTextContent('Forecast unavailable');
  });

  it('fetches weather for a new city when the user searches', async () => {
    const newLocation: GeoLocation = { name: 'New York', latitude: 40.71, longitude: -74.0 };
    const newData: WeatherData = { ...mockWeatherData, city: 'New York' };
    mockFetchCoordinates
      .mockResolvedValueOnce(mockLocation)
      .mockResolvedValueOnce(newLocation);
    mockFetchForecast
      .mockResolvedValueOnce(mockWeatherData)
      .mockResolvedValueOnce(newData);

    renderHomeScreen();
    await waitFor(() => screen.getByTestId('weather-card'));

    fireEvent.changeText(screen.getByTestId('city-input'), 'New York');
    fireEvent.press(screen.getByTestId('search-button'));

    await waitFor(() =>
      expect(screen.getByTestId('weather-city')).toHaveTextContent('New York')
    );
    expect(mockFetchCoordinates).toHaveBeenCalledWith('New York');
  });

  it('shows the refresh button once data is loaded', async () => {
    renderHomeScreen();
    await waitFor(() => screen.getByTestId('refresh-button'));
    expect(screen.getByTestId('refresh-button')).toBeTruthy();
  });
});
