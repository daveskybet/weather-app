import { weatherService } from '@/services/weatherService';

const mockGeoResponse = {
  results: [
    { name: 'London', latitude: 51.5085, longitude: -0.1257 },
  ],
};

const mockForecastResponse = {
  current: {
    temperature_2m: 17.8,
    apparent_temperature: 15.2,
    relative_humidity_2m: 68,
    wind_speed_10m: 12.4,
    weather_code: 2,
  },
  daily: {
    time: [
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
      '2024-01-04',
      '2024-01-05',
      '2024-01-06',
      '2024-01-07',
    ],
    weather_code: [2, 61, 63, 0, 3, 95, 71],
    temperature_2m_max: [18, 14, 12, 22, 19, 11, 8],
    temperature_2m_min: [10, 9, 8, 14, 12, 7, 2],
    precipitation_probability_max: [10, 70, 90, 0, 30, 85, 60],
  },
};

function mockFetch(...responses: object[]) {
  let callCount = 0;
  jest.spyOn(globalThis, 'fetch').mockImplementation(() => {
    const body = responses[callCount] ?? responses[responses.length - 1];
    callCount++;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(body),
    } as Response);
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('weatherService', () => {
  it('geocodes the city and returns mapped weather data', async () => {
    mockFetch(mockGeoResponse, mockForecastResponse);
    const data = await weatherService.fetchWeather('London');

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
    mockFetch(mockGeoResponse, mockForecastResponse);
    const data = await weatherService.fetchWeather('London');

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

  it('maps WMO codes to the correct conditions in the forecast', async () => {
    mockFetch(mockGeoResponse, mockForecastResponse);
    const data = await weatherService.fetchWeather('London');

    expect(data.forecast[1].condition).toBe('rainy');   // code 61
    expect(data.forecast[3].condition).toBe('sunny');   // code 0
    expect(data.forecast[5].condition).toBe('stormy');  // code 95
    expect(data.forecast[6].condition).toBe('snowy');   // code 71
  });

  it('throws when the city is not found', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    } as Response);

    await expect(weatherService.fetchWeather('Atlantis')).rejects.toThrow(
      'City not found: Atlantis'
    );
  });

  it('throws when the geocoding request fails', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    } as Response);

    await expect(weatherService.fetchWeather('London')).rejects.toThrow(
      'Geocoding request failed: 500'
    );
  });

  it('throws when the forecast request fails', async () => {
    jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeoResponse),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve({}),
      } as Response);

    await expect(weatherService.fetchWeather('London')).rejects.toThrow(
      'Forecast request failed: 503'
    );
  });
});
