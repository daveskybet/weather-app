export function formatDay(dateStr: string, index: number): string {
  if (index === 0) return 'Today';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    weekday: 'short',
  });
}
