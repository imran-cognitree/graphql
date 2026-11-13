/**
 * Parse a backend date string in "yyyy-MM-dd HH:mm:ss" format
 * and return a human-readable representation like "Nov 13, 2026, 1:45 PM".
 * Returns an empty string for null or empty input.
 */
export function formatHumanDate(dateStr: string | null): string {
  if (!dateStr || dateStr.trim() === '') {
    return '';
  }

  const date = new Date(dateStr.replace(' ', 'T'));

  if (isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
