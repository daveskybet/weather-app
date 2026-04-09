import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useWeather } from '@/hooks/useWeather';
import { WeatherService } from '@/services/weatherService';
import { WeatherData } from '@/types';

const mockWeatherData: WeatherData = {
  city: 'London',
  temperature: 12,
  feelsLike: 10,
  humidity: 80,
  condition: 'rainy',
  description: 'Light rain',
  windSpeed: 20,
  updatedAt: new Date('2024-01-01'),
};

function makeMockService(overrides?: Partial<WeatherService>): WeatherService {
  return {
    fetchWeather: jest.fn().mockResolvedValue(mockWeatherData),
    ...overrides,
  };
}

describe('useWeather', () => {
  it('starts with loading state and no data', async () => {
    const service = makeMockService();
    const { result } = renderHook(() => useWeather(service, 'London'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('populates data on successful fetch', async () => {
    const service = makeMockService();
    const { result } = renderHook(() => useWeather(service, 'London'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.error).toBeNull();
    expect(service.fetchWeather).toHaveBeenCalledWith('London');
  });

  it('sets error state when the service rejects', async () => {
    const service = makeMockService({
      fetchWeather: jest.fn().mockRejectedValue(new Error('City not found')),
    });
    const { result } = renderHook(() => useWeather(service, 'Unknown'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('City not found');
  });

  it('fetches again when setCity is called', async () => {
    const service = makeMockService();
    const { result } = renderHook(() => useWeather(service, 'London'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setCity('Paris');
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(service.fetchWeather).toHaveBeenCalledWith('Paris');
    expect(result.current.city).toBe('Paris');
  });

  it('re-fetches when refresh is called', async () => {
    const service = makeMockService();
    const { result } = renderHook(() => useWeather(service, 'London'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(service.fetchWeather).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(service.fetchWeather).toHaveBeenCalledTimes(2);
  });

  it('uses default city when none is provided', async () => {
    const service = makeMockService();
    const { result } = renderHook(() => useWeather(service));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(service.fetchWeather).toHaveBeenCalledWith('Sheffield');
  });

  it('clears previous data and error when fetching a new city', async () => {
    const service = makeMockService({
      fetchWeather: jest
        .fn()
        .mockResolvedValueOnce(mockWeatherData)
        .mockRejectedValueOnce(new Error('Not found')),
    });
    const { result } = renderHook(() => useWeather(service, 'London'));

    await waitFor(() => expect(result.current.data).toEqual(mockWeatherData));

    act(() => {
      result.current.setCity('Nowhere');
    });

    // Mid-flight: previous data is cleared, loading is true
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Not found');
  });
});
