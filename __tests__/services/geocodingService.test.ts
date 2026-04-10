import { fetchCoordinates, sanitiseCity } from '@/services/geocodingService';

afterEach(() => jest.restoreAllMocks());

describe('sanitiseCity', () => {
  it('returns the city unchanged when already clean', () => {
    expect(sanitiseCity('London')).toBe('London');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitiseCity('  Paris  ')).toBe('Paris');
  });

  it('collapses internal whitespace runs to a single space', () => {
    expect(sanitiseCity('New  York')).toBe('New York');
  });

  it('accepts city names with hyphens', () => {
    expect(sanitiseCity('Stratford-upon-Avon')).toBe('Stratford-upon-Avon');
  });

  it('accepts city names with apostrophes', () => {
    expect(sanitiseCity("L'Aquila")).toBe("L'Aquila");
  });

  it('accepts city names with periods', () => {
    expect(sanitiseCity('St. Louis')).toBe('St. Louis');
  });

  it('accepts city names with commas', () => {
    expect(sanitiseCity('Frankfurt, Main')).toBe('Frankfurt, Main');
  });

  it('accepts city names with accented characters', () => {
    expect(sanitiseCity('Düsseldorf')).toBe('Düsseldorf');
    expect(sanitiseCity('São Paulo')).toBe('São Paulo');
    expect(sanitiseCity('Montréal')).toBe('Montréal');
  });

  it('accepts city names with digits', () => {
    expect(sanitiseCity('100 Mile House')).toBe('100 Mile House');
  });

  it('throws when the input is empty', () => {
    expect(() => sanitiseCity('')).toThrow('City name must not be empty');
  });

  it('throws when the input is only whitespace', () => {
    expect(() => sanitiseCity('   ')).toThrow('City name must not be empty');
  });

  it('throws when the input exceeds 100 characters', () => {
    expect(() => sanitiseCity('A'.repeat(101))).toThrow(
      'City name must not exceed 100 characters'
    );
  });

  it('accepts exactly 100 characters', () => {
    expect(() => sanitiseCity('A'.repeat(100))).not.toThrow();
  });

  it('throws when the input contains angle brackets', () => {
    expect(() => sanitiseCity('<script>')).toThrow('City name contains invalid characters');
  });

  it('throws when the input contains semicolons', () => {
    expect(() => sanitiseCity('London; DROP TABLE cities')).toThrow(
      'City name contains invalid characters'
    );
  });

  it('throws when the input contains control characters', () => {
    expect(() => sanitiseCity('London\x00')).toThrow('City name contains invalid characters');
    expect(() => sanitiseCity('London\n')).toThrow('City name contains invalid characters');
  });

  it('throws when the input contains ampersands', () => {
    expect(() => sanitiseCity('foo&bar=baz')).toThrow('City name contains invalid characters');
  });
});

describe('fetchCoordinates', () => {
  it('returns a GeoLocation for a valid city', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: [{ name: 'London', latitude: 51.5085, longitude: -0.1257 }],
      }),
    } as Response);

    const location = await fetchCoordinates('London');
    expect(location).toEqual({ name: 'London', latitude: 51.5085, longitude: -0.1257 });
  });

  it('sanitises the city before fetching', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: [{ name: 'Paris', latitude: 48.85, longitude: 2.35 }],
      }),
    } as Response);

    await fetchCoordinates('  Paris  ');
    const calledUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('name=Paris');
    expect(calledUrl).not.toContain('name=++Paris++');
  });

  it('throws before fetching when the city is empty', async () => {
    const spy = jest.spyOn(globalThis, 'fetch');
    await expect(fetchCoordinates('   ')).rejects.toThrow('City name must not be empty');
    expect(spy).not.toHaveBeenCalled();
  });

  it('throws before fetching when the city contains invalid characters', async () => {
    const spy = jest.spyOn(globalThis, 'fetch');
    await expect(fetchCoordinates('<script>alert(1)</script>')).rejects.toThrow(
      'City name contains invalid characters'
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('throws when the city is not found', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    } as Response);

    await expect(fetchCoordinates('Atlantis')).rejects.toThrow(
      'City not found: Atlantis'
    );
  });

  it('throws when the request fails', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    } as Response);

    await expect(fetchCoordinates('London')).rejects.toThrow(
      'Geocoding request failed: 500'
    );
  });
});
