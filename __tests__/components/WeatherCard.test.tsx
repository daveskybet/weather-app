import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { WeatherCard } from '@/components/WeatherCard';
import { WeatherData } from '@/types';

const mockData: WeatherData = {
  city: 'Tokyo',
  temperature: 22,
  feelsLike: 20,
  humidity: 65,
  condition: 'sunny',
  description: 'Clear skies',
  windSpeed: 8,
  updatedAt: new Date('2024-06-01'),
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
});
