/**
 * Normalizes text by:
 * - Replacing line breaks with spaces
 * - Collapsing multiple spaces into single spaces
 * - Trimming leading and trailing whitespace
 */
export const normalizeText = (text: string): string => {
  return text
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

