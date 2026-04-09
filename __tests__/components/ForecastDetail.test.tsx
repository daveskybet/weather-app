import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { ForecastDetail } from '@/components/ForecastDetail';
import { DailyForecast, HourlyForecast } from '@/types';

const mockHourly: HourlyForecast[] = [
  { time: '06:00', temperature: 14, condition: 'cloudy', precipitationProbability: 10 },
  { time: '09:00', temperature: 17, condition: 'sunny', precipitationProbability: 5 },
  { time: '12:00', temperature: 21, condition: 'sunny', precipitationProbability: 0 },
  { time: '15:00', temperature: 22, condition: 'sunny', precipitationProbability: 0 },
  { time: '18:00', temperature: 18, condition: 'cloudy', precipitationProbability: 20 },
  { time: '21:00', temperature: 14, condition: 'rainy', precipitationProbability: 70 },
];

const baseItem: DailyForecast = {
  date: '2024-06-03',
  condition: 'sunny',
  description: 'Clear sky',
  tempMax: 22,
  tempMin: 12,
  precipitationProbability: 10,
  hourly: mockHourly,
};

describe('ForecastDetail', () => {
  it('renders the forecast-detail testID', () => {
    render(<ForecastDetail item={baseItem} />);
    expect(screen.getByTestId('forecast-detail')).toBeTruthy();
  });

  it('renders an item for each hourly entry', () => {
    render(<ForecastDetail item={baseItem} />);
    mockHourly.forEach((_, index) => {
      expect(screen.getByTestId(`hourly-item-${index}`)).toBeTruthy();
    });
  });

  it('renders the time label for each hour', () => {
    render(<ForecastDetail item={baseItem} />);
    expect(screen.getByTestId('hourly-time-0')).toHaveTextContent('06:00');
    expect(screen.getByTestId('hourly-time-2')).toHaveTextContent('12:00');
  });

  it('renders the temperature for each hour', () => {
    render(<ForecastDetail item={baseItem} />);
    expect(screen.getByTestId('hourly-temp-0')).toHaveTextContent('14°');
    expect(screen.getByTestId('hourly-temp-3')).toHaveTextContent('22°');
  });

  it('renders the precipitation probability for each hour', () => {
    render(<ForecastDetail item={baseItem} />);
    expect(screen.getByTestId('hourly-precip-0')).toHaveTextContent('10%');
    expect(screen.getByTestId('hourly-precip-5')).toHaveTextContent('70%');
  });

  it('renders the correct emoji for each hour condition', () => {
    render(<ForecastDetail item={baseItem} />);
    expect(screen.getByTestId('hourly-emoji-0')).toHaveTextContent('☁️');
    expect(screen.getByTestId('hourly-emoji-1')).toHaveTextContent('☀️');
    expect(screen.getByTestId('hourly-emoji-5')).toHaveTextContent('🌧️');
  });

  it('returns null when hourly data is empty', () => {
    render(<ForecastDetail item={{ ...baseItem, hourly: [] }} />);
    expect(screen.queryByTestId('forecast-detail')).toBeNull();
  });
});
