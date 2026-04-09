import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { ForecastRow } from '@/components/ForecastRow';
import { DailyForecast } from '@/types';

const baseItem: DailyForecast = {
  date: '2024-06-03',
  condition: 'rainy',
  description: 'Moderate rain',
  tempMax: 16,
  tempMin: 9,
  precipitationProbability: 80,
};

describe('ForecastRow', () => {
  it('renders the testID for the given index', () => {
    render(<ForecastRow item={baseItem} index={2} />);
    expect(screen.getByTestId('forecast-row-2')).toBeTruthy();
  });

  it('renders max and min temperature', () => {
    render(<ForecastRow item={baseItem} index={0} />);
    expect(screen.getByTestId('forecast-temp-0')).toHaveTextContent('16° / 9°');
  });

  it('renders the description', () => {
    render(<ForecastRow item={baseItem} index={0} />);
    expect(screen.getByTestId('forecast-desc-0')).toHaveTextContent(
      'Moderate rain'
    );
  });

  it('shows "Today" for index 0', () => {
    render(<ForecastRow item={baseItem} index={0} />);
    expect(screen.getByTestId('forecast-day-0')).toHaveTextContent('Today');
  });

  it('shows a short weekday name for index > 0', () => {
    // 2024-06-03 is a Monday
    render(<ForecastRow item={baseItem} index={1} />);
    expect(screen.getByTestId('forecast-day-1')).toHaveTextContent('Mon');
  });

  it('renders the correct emoji for each condition', () => {
    const conditions: Array<[DailyForecast['condition'], string]> = [
      ['sunny', '☀️'],
      ['cloudy', '☁️'],
      ['rainy', '🌧️'],
      ['snowy', '❄️'],
      ['windy', '💨'],
      ['stormy', '⛈️'],
    ];

    for (const [condition, emoji] of conditions) {
      const { unmount } = render(
        <ForecastRow item={{ ...baseItem, condition }} index={0} />
      );
      expect(screen.getByTestId('forecast-emoji-0')).toHaveTextContent(emoji);
      unmount();
    }
  });
});

