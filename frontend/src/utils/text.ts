/**
 * Truncate text to the given maximum length, appending "..." if truncated.
 * Returns an empty string for null or empty input.
 */
export function truncateText(text: string | null, maxLength: number = 100): string {
  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + '...';
}
