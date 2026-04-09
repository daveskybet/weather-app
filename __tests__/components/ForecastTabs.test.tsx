import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { ForecastTabs } from '@/components/ForecastTabs';
import { DailyForecast, HourlyForecast } from '@/types';

const day1Hourly: HourlyForecast[] = [
  { time: '06:00', temperature: 20, condition: 'sunny', precipitationProbability: 5 },
  { time: '12:00', temperature: 24, condition: 'sunny', precipitationProbability: 0 },
];

const day2Hourly: HourlyForecast[] = [
  { time: '06:00', temperature: 12, condition: 'rainy', precipitationProbability: 80 },
  { time: '12:00', temperature: 15, condition: 'rainy', precipitationProbability: 75 },
];

const mockForecast: DailyForecast[] = [
  {
    date: '2024-06-03',
    condition: 'sunny',
    description: 'Clear sky',
    tempMax: 24,
    tempMin: 14,
    precipitationProbability: 5,
    hourly: day1Hourly,
  },
  {
    date: '2024-06-04',
    condition: 'rainy',
    description: 'Moderate rain',
    tempMax: 16,
    tempMin: 9,
    precipitationProbability: 80,
    hourly: day2Hourly,
  },
  {
    date: '2024-06-05',
    condition: 'stormy',
    description: 'Thunderstorm',
    tempMax: 13,
    tempMin: 8,
    precipitationProbability: 95,
    hourly: [],
  },
];

describe('ForecastTabs', () => {
  it('renders a tab for each forecast day', () => {
    render(<ForecastTabs forecast={mockForecast} />);
    expect(screen.getByTestId('forecast-tab-0')).toBeTruthy();
    expect(screen.getByTestId('forecast-tab-1')).toBeTruthy();
    expect(screen.getByTestId('forecast-tab-2')).toBeTruthy();
  });

  it('shows "Today" on the first tab', () => {
    render(<ForecastTabs forecast={mockForecast} />);
    expect(screen.getByTestId('forecast-tab-day-0')).toHaveTextContent('Today');
  });

  it('shows a weekday name on subsequent tabs', () => {
    render(<ForecastTabs forecast={mockForecast} />);
    // 2024-06-04 is Tuesday
    expect(screen.getByTestId('forecast-tab-day-1')).toHaveTextContent('Tue');
  });

  it('selects the first tab by default', () => {
    render(<ForecastTabs forecast={mockForecast} />);
    expect(screen.getByTestId('forecast-tab-0').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('forecast-tab-1').props.accessibilityState.selected).toBe(false);
  });

  it('shows hourly data for the first day by default', () => {
    render(<ForecastTabs forecast={mockForecast} />);
    expect(screen.getByTestId('forecast-detail')).toBeTruthy();
    expect(screen.getByTestId('hourly-time-0')).toHaveTextContent('06:00');
    expect(screen.getByTestId('hourly-temp-0')).toHaveTextContent('20°');
  });

  it('switches to the selected day hourly data when a tab is pressed', () => {
    render(<ForecastTabs forecast={mockForecast} />);
    fireEvent.press(screen.getByTestId('forecast-tab-1'));
    expect(screen.getByTestId('hourly-time-0')).toHaveTextContent('06:00');
    expect(screen.getByTestId('hourly-temp-0')).toHaveTextContent('12°');
  });

  it('marks the pressed tab as selected', () => {
    render(<ForecastTabs forecast={mockForecast} />);
    fireEvent.press(screen.getByTestId('forecast-tab-2'));
    expect(screen.getByTestId('forecast-tab-2').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('forecast-tab-0').props.accessibilityState.selected).toBe(false);
  });

  it('hides the detail panel when the selected day has no hourly data', () => {
    render(<ForecastTabs forecast={mockForecast} />);
    fireEvent.press(screen.getByTestId('forecast-tab-2'));
    expect(screen.queryByTestId('forecast-detail')).toBeNull();
  });

  it('returns null when forecast is empty', () => {
    render(<ForecastTabs forecast={[]} />);
    expect(screen.queryByTestId('forecast-tab-bar')).toBeNull();
  });
});
