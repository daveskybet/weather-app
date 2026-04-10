import { fetchForecast } from '@/services/forecastService';
import { GeoLocation } from '@/services/geocodingService';

const mockLocation: GeoLocation = { name: 'London', latitude: 51.5085, longitude: -0.1257 };

const DAILY_DATES = [
  '2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04',
  '2024-01-05', '2024-01-06', '2024-01-07',
];

const hourlyTimes = DAILY_DATES.flatMap((date) =>
  Array.from({ length: 24 }, (_, h) => `${date}T${String(h).padStart(2, '0')}:00`)
);

const mockForecastResponse = {
  current: {
    temperature_2m: 17.8,
    apparent_temperature: 15.2,
    relative_humidity_2m: 68,
    wind_speed_10m: 12.4,
    weather_code: 2,
  },
  daily: {
    time: DAILY_DATES,
    weather_code: [2, 61, 63, 0, 3, 95, 71],
    temperature_2m_max: [18, 14, 12, 22, 19, 11, 8],
    temperature_2m_min: [10, 9, 8, 14, 12, 7, 2],
    precipitation_probability_max: [10, 70, 90, 0, 30, 85, 60],
  },
  hourly: {
    time: hourlyTimes,
    temperature_2m: Array.from({ length: 168 }, (_, i) => 10 + (i % 24)),
    weather_code: Array(168).fill(2),
    precipitation_probability: Array(168).fill(20),
  },
};

afterEach(() => jest.restoreAllMocks());

describe('fetchForecast', () => {
  it('returns mapped weather data from the API response', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockForecastResponse),
    } as Response);

    const data = await fetchForecast(mockLocation);

    expect(data).toMatchObject({
      city: 'London',
      temperature: 18,
      feelsLike: 15,
      humidity: 68,
      condition: 'cloudy',
      description: 'Partly cloudy',
      windSpeed: 12,
      updatedAt: expect.any(Date),
    });
  });

  it('returns 7 forecast days', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockForecastResponse),
    } as Response);

    const data = await fetchForecast(mockLocation);

    expect(data.forecast).toHaveLength(7);
    expect(data.forecast[0]).toMatchObject({
      date: '2024-01-01',
      condition: 'cloudy',
      description: 'Partly cloudy',
      tempMax: 18,
      tempMin: 10,
      precipitationProbability: 10,
    });
  });

  it('maps WMO codes correctly across forecast days', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockForecastResponse),
    } as Response);

    const data = await fetchForecast(mockLocation);

    expect(data.forecast[1].condition).toBe('rainy');   // code 61
    expect(data.forecast[3].condition).toBe('sunny');   // code 0
    expect(data.forecast[5].condition).toBe('stormy');  // code 95
    expect(data.forecast[6].condition).toBe('snowy');   // code 71
  });

  it('attaches 24 hourly entries to each forecast day', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockForecastResponse),
    } as Response);

    const data = await fetchForecast(mockLocation);

    data.forecast.forEach((day) => expect(day.hourly).toHaveLength(24));
    expect(data.forecast[0].hourly[14].time).toBe('14:00');
  });

  it('throws when the request fails', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    } as Response);

    await expect(fetchForecast(mockLocation)).rejects.toThrow(
      'Forecast request failed: 503'
    );
  });
});
