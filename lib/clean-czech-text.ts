// The model occasionally slips a Cyrillic letter into otherwise Czech text
// (e.g. "zařadил" for "zařadil"). Transliterate any Cyrillic back to Latin,
// phonetically (и -> i, л -> l), so users never see it.
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "ž", з: "z", и: "i", й: "j",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "ch", ц: "c", ч: "č", ш: "š", щ: "šč", ъ: "", ы: "y", ь: "", э: "e", ю: "ju", я: "ja",
};

export function cleanCzechText(text: string): string {
  return text.replace(/[Ѐ-ӿ]/g, (ch) => {
    const lower = ch.toLowerCase();
    const latin = CYRILLIC_TO_LATIN[lower];
    if (latin === undefined) return "";
    return ch === lower ? latin : latin.charAt(0).toUpperCase() + latin.slice(1);
  });
}
