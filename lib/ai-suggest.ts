// Autocomplete for the AI assistant's search box: completes the word(s) being typed from a small
// vocabulary of the site's own terms (neighbourhoods, cuisines, dishes, tags, place names).

export type SuggestionKind = "area" | "cuisine" | "dish" | "tag" | "place" | "keyword";

export interface SuggestionTerm {
  text: string;
  kind: SuggestionKind;
}

export interface Completion {
  term: SuggestionTerm;
  // The whole query with the typed fragment replaced by the term, ready to put in the input
  value: string;
}

export const normalizeText = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// What people usually mean first: food words, then neighbourhoods, then individual places
const KIND_ORDER: Record<SuggestionKind, number> = { keyword: 0, dish: 0, cuisine: 0, tag: 0, area: 1, place: 2 };

const MAX_WORDS = 3; // longest fragment tried, e.g. "Náměstí Mí" -> "Náměstí Míru"

export function suggestCompletions(input: string, terms: SuggestionTerm[], limit = 6): Completion[] {
  // A trailing space means the last word is finished - nothing to complete
  if (!input.trim() || /\s$/.test(input)) return [];

  const words = input.trim().split(/\s+/);
  const prepared = terms.map((term) => ({ term, norm: normalizeText(term.text) }));

  for (let k = Math.min(MAX_WORDS, words.length); k >= 1; k--) {
    const fragmentWords = words.slice(-k);
    const fragment = normalizeText(fragmentWords.join(" "));
    if (fragment.length < 2) continue;

    const scored: { term: SuggestionTerm; norm: string; rank: number }[] = [];
    for (const { term, norm } of prepared) {
      if (norm === fragment) continue; // already typed in full
      if (norm.startsWith(fragment)) scored.push({ term, norm, rank: 0 });
      // a later word of a multi-word term, e.g. "mir" -> "Náměstí Míru" (single words only)
      else if (k === 1 && norm.split(/[\s.]+/).some((w) => w.length > 2 && w.startsWith(fragment))) {
        scored.push({ term, norm, rank: 1 });
      }
    }
    if (scored.length === 0) continue;

    scored.sort(
      (a, b) =>
        a.rank - b.rank ||
        KIND_ORDER[a.term.kind] - KIND_ORDER[b.term.kind] ||
        a.norm.length - b.norm.length ||
        a.norm.localeCompare(b.norm)
    );

    const before = words.slice(0, -k).join(" ");
    const seen = new Set<string>();
    const completions: Completion[] = [];
    for (const { term, norm } of scored) {
      if (seen.has(norm)) continue;
      seen.add(norm);
      completions.push({ term, value: `${before ? before + " " : ""}${term.text} ` });
      if (completions.length >= limit) break;
    }
    return completions;
  }
  return [];
}
