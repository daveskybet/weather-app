import { formatDay } from '@/utils/formatDay';

describe('formatDay', () => {
  it('returns "Today" for index 0 regardless of date', () => {
    expect(formatDay('2024-01-01', 0)).toBe('Today');
  });

  it('returns a short weekday for index > 0', () => {
    // 2024-06-03 is a Monday
    expect(formatDay('2024-06-03', 1)).toBe('Mon');
  });

  it('returns the correct weekday for each day of the week', () => {
    // 2024-06-03 Mon, 2024-06-04 Tue, ..., 2024-06-09 Sun
    const expected = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    expected.forEach((day, i) => {
      const date = `2024-06-${String(i + 3).padStart(2, '0')}`;
      expect(formatDay(date, 1)).toBe(day);
    });
  });
});
