import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from '@/screens/HomeScreen';
import * as weatherServiceModule from '@/services/weatherService';
import { WeatherData } from '@/types';

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

// Spy on the singleton service used by HomeScreen
const fetchWeatherSpy = jest
  .spyOn(weatherServiceModule.weatherService, 'fetchWeather')
  .mockResolvedValue(mockWeatherData);

beforeEach(() => {
  fetchWeatherSpy.mockClear();
  fetchWeatherSpy.mockResolvedValue(mockWeatherData);
});

function renderHomeScreen() {
  return render(
    <SafeAreaProvider>
      <HomeScreen />
    </SafeAreaProvider>
  );
}

describe('HomeScreen', () => {
  it('shows a loading spinner on mount', async () => {
    renderHomeScreen();
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
    // Drain async state to avoid act() warnings on subsequent tests
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).toBeNull());
  });

  it('shows weather data after loading resolves', async () => {
    renderHomeScreen();
    await waitFor(() =>
      expect(screen.queryByTestId('loading-spinner')).toBeNull()
    );
    expect(screen.getByTestId('weather-card')).toBeTruthy();
    expect(screen.getByTestId('weather-city')).toHaveTextContent('Sheffield');
  });

  it('shows an error message when the fetch fails', async () => {
    fetchWeatherSpy.mockRejectedValueOnce(new Error('Service unavailable'));
    renderHomeScreen();
    await waitFor(() =>
      expect(screen.getByTestId('error-message')).toBeTruthy()
    );
    expect(screen.getByTestId('error-text')).toHaveTextContent(
      'Service unavailable'
    );
  });

  it('retries the fetch when the retry button is pressed', async () => {
    fetchWeatherSpy
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValueOnce(mockWeatherData);

    renderHomeScreen();
    await waitFor(() => screen.getByTestId('retry-button'));
    fireEvent.press(screen.getByTestId('retry-button'));

    await waitFor(() =>
      expect(screen.getByTestId('weather-card')).toBeTruthy()
    );
    expect(fetchWeatherSpy).toHaveBeenCalledTimes(2);
  });

  it('fetches weather for a new city when the user searches', async () => {
    const newCityData: WeatherData = {
      ...mockWeatherData,
      city: 'New York',
    };
    fetchWeatherSpy
      .mockResolvedValueOnce(mockWeatherData)
      .mockResolvedValueOnce(newCityData);

    renderHomeScreen();
    await waitFor(() => screen.getByTestId('weather-card'));

    fireEvent.changeText(screen.getByTestId('city-input'), 'New York');
    fireEvent.press(screen.getByTestId('search-button'));

    await waitFor(() =>
      expect(screen.getByTestId('weather-city')).toHaveTextContent('New York')
    );
    expect(fetchWeatherSpy).toHaveBeenCalledWith('New York');
  });

  it('shows the refresh button once data is loaded', async () => {
    renderHomeScreen();
    await waitFor(() => screen.getByTestId('refresh-button'));
    expect(screen.getByTestId('refresh-button')).toBeTruthy();
  });
});
