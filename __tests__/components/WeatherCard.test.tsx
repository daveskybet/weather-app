import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { WeatherCard } from '@/components/WeatherCard';
import { DailyForecast, WeatherData } from '@/types';

const mockForecast: DailyForecast[] = [
  {
    date: '2024-06-01',
    condition: 'sunny',
    description: 'Clear sky',
    tempMax: 24,
    tempMin: 14,
    precipitationProbability: 0,
    hourly: [],
  },
  {
    date: '2024-06-02',
    condition: 'cloudy',
    description: 'Partly cloudy',
    tempMax: 20,
    tempMin: 12,
    precipitationProbability: 20,
    hourly: [],
  },
  {
    date: '2024-06-03',
    condition: 'rainy',
    description: 'Moderate rain',
    tempMax: 16,
    tempMin: 11,
    precipitationProbability: 80,
    hourly: [],
  },
];

const mockData: WeatherData = {
  city: 'Tokyo',
  temperature: 22,
  feelsLike: 20,
  humidity: 65,
  condition: 'sunny',
  description: 'Clear skies',
  windSpeed: 8,
  updatedAt: new Date('2024-06-01'),
  forecast: mockForecast,
};

describe('WeatherCard', () => {
  it('renders the city name', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByTestId('weather-city')).toHaveTextContent('Tokyo');
  });

  it('renders the temperature with the degree symbol', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByTestId('weather-temperature')).toHaveTextContent('22°C');
  });

  it('renders the description', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByTestId('weather-description')).toHaveTextContent(
      'Clear skies'
    );
  });

  it('renders feels-like temperature', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByTestId('weather-feels-like')).toHaveTextContent('20°C');
  });

  it('renders humidity percentage', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByTestId('weather-humidity')).toHaveTextContent('65%');
  });

  it('renders wind speed', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByTestId('weather-wind')).toHaveTextContent('8 km/h');
  });

  it('has the weather-card testID', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByTestId('weather-card')).toBeTruthy();
  });

  it('renders the forecast section when forecast data is present', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByTestId('forecast-section')).toBeTruthy();
  });

  it('renders the forecast tab bar', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByTestId('forecast-tab-bar')).toBeTruthy();
  });

  it('does not render the forecast section when forecast is empty', () => {
    render(<WeatherCard data={{ ...mockData, forecast: [] }} />);
    expect(screen.queryByTestId('forecast-section')).toBeNull();
  });
});
