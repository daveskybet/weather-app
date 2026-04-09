import { weatherService } from '@/services/weatherService';

describe('weatherService', () => {
  it('resolves with weather data for a valid city', async () => {
    const data = await weatherService.fetchWeather('London');
    expect(data).toMatchObject({
      city: 'London',
      temperature: expect.any(Number),
      feelsLike: expect.any(Number),
      humidity: expect.any(Number),
      condition: expect.any(String),
      description: expect.any(String),
      windSpeed: expect.any(Number),
      updatedAt: expect.any(Date),
    });
  }, 5000);

  it('rejects with an error when city is "error"', async () => {
    await expect(weatherService.fetchWeather('error')).rejects.toThrow(
      'City not found'
    );
  }, 5000);

  it('returns data with the provided city name for unknown cities', async () => {
    const data = await weatherService.fetchWeather('Atlantis');
    expect(data.city).toBe('Atlantis');
  }, 5000);
});
