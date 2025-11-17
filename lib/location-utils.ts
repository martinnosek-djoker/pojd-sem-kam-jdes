// Czech prepositions and conjunctions that should remain lowercase
const LOWERCASE_WORDS = new Set([
  'z', 's', 'v', 'k', 'o', 'u',
  'do', 'na', 'po', 'od', 'za', 'před', 'mezi', 'nad', 'pod',
  'při', 'bez', 'proti', 'přes', 'během', 'kolem', 'okolo',
  'poblíž', 'vedle', 'místo', 'kromě', 'podle',
  'a', 'i', 'ale', 'nebo'
]);

/**
 * Normalize location name with proper Czech capitalization
 * - First word is always capitalized
 * - Prepositions and conjunctions remain lowercase (unless first word)
 * - Other words are capitalized
 * - Preserves abbreviations like "I. P."
 */
export function normalizeLocationName(location: string): string {
  const trimmed = location.trim();
  if (!trimmed) return '';

  const words = trimmed.split(' ');

  return words.map((word, index) => {
    // Empty word
    if (!word) return word;

    // First word is always capitalized
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    // Check if it's a lowercase word (preposition/conjunction)
    const lowerWord = word.toLowerCase();
    if (LOWERCASE_WORDS.has(lowerWord)) {
      return lowerWord;
    }

    // Regular word - capitalize first letter
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}
