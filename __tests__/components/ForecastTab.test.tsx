import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { ForecastTab } from '@/components/ForecastTab';
import { DailyForecast } from '@/types';

const baseItem: DailyForecast = {
  date: '2024-06-03',
  condition: 'sunny',
  description: 'Clear sky',
  tempMax: 24,
  tempMin: 14,
  precipitationProbability: 5,
  hourly: [],
};

describe('ForecastTab', () => {
  it('renders with the correct testID for the given index', () => {
    render(<ForecastTab item={baseItem} index={2} isSelected={false} onPress={jest.fn()} />);
    expect(screen.getByTestId('forecast-tab-2')).toBeTruthy();
  });

  it('shows "Today" for index 0', () => {
    render(<ForecastTab item={baseItem} index={0} isSelected={false} onPress={jest.fn()} />);
    expect(screen.getByTestId('forecast-tab-day-0')).toHaveTextContent('Today');
  });

  it('shows a short weekday name for index > 0', () => {
    // 2024-06-03 is Monday
    render(<ForecastTab item={baseItem} index={1} isSelected={false} onPress={jest.fn()} />);
    expect(screen.getByTestId('forecast-tab-day-1')).toHaveTextContent('Mon');
  });

  it('renders max/min temperature', () => {
    render(<ForecastTab item={baseItem} index={0} isSelected={false} onPress={jest.fn()} />);
    expect(screen.getByTestId('forecast-tab-temp-0')).toHaveTextContent('24° / 14°');
  });

  it('renders the description', () => {
    render(<ForecastTab item={baseItem} index={0} isSelected={false} onPress={jest.fn()} />);
    expect(screen.getByTestId('forecast-tab-desc-0')).toHaveTextContent('Clear sky');
  });

  it('marks the tab as selected via accessibilityState', () => {
    render(<ForecastTab item={baseItem} index={0} isSelected={true} onPress={jest.fn()} />);
    expect(screen.getByTestId('forecast-tab-0').props.accessibilityState.selected).toBe(true);
  });

  it('marks the tab as not selected via accessibilityState', () => {
    render(<ForecastTab item={baseItem} index={0} isSelected={false} onPress={jest.fn()} />);
    expect(screen.getByTestId('forecast-tab-0').props.accessibilityState.selected).toBe(false);
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ForecastTab item={baseItem} index={0} isSelected={false} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('forecast-tab-0'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the correct emoji for each condition', () => {
    const cases: Array<[DailyForecast['condition'], string]> = [
      ['sunny', '☀️'],
      ['cloudy', '☁️'],
      ['rainy', '🌧️'],
      ['snowy', '❄️'],
      ['windy', '💨'],
      ['stormy', '⛈️'],
    ];
    for (const [condition, emoji] of cases) {
      const { unmount } = render(
        <ForecastTab item={{ ...baseItem, condition }} index={0} isSelected={false} onPress={jest.fn()} />
      );
      expect(screen.getByTestId('forecast-tab-emoji-0')).toHaveTextContent(emoji);
      unmount();
    }
  });
});
