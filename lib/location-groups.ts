// Utility pro seskupování pražských lokalit do větších oblastí
// - nedotýká se uložených dat, pouze mapuje vstupní string na název skupiny

// Odstranění diakritiky a normalizace pro porovnávání
export function normalizeString(input: string): string {
  return (input || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Definice skupin a aliasů (v aliasích bez diakritiky a lowercase)
// Klíč je zobrazované jméno skupiny (s diakritikou)
export const LOCATION_GROUPS: Record<string, string[]> = {
  Centrum: [
    "stare mesto",
    "nove mesto",
    "karlovo namesti",
    "narodni trida",
    "narodni divadlo",
    "vaclavske namesti",
    "namesti republiky",
    "staromestska",
    "dlouha",
    "vyton",
  ],
  "Vinohrady & Vršovice": [
    "vinohrady",
    "vrsovice",
    "namesti miru",
    "jiriho z podebrad",
    "i. p. pavlova",
    "ip pavlova",
    "i p pavlova",
  ],
  "Holešovice & Letná": ["holesovice", "letna"],
  "Smíchov & Anděl": ["smichov", "andel", "smichovske nadrazi"],
  "Karlín & Invalidovna": ["karlin", "invalidovna", "florenc"],
  "Dejvice & Suchdol": ["dejvice", "suchdol", "hradcanska"],
  "Malá Strana & Hradčany": ["mala strana", "ujezd", "malostranska"],
  "Žižkov": ["zizkov"],
  "Břevnov": ["brevnov"],
  "Košíře": ["kosire"],
  "Pankrác & Budějovická": ["pankrac", "kacerov", "brumlovka", "budejovicka"],
  "Lužiny (Západ)": ["luziny", "stodulky"],
  "Troja": ["troja"],
  "Sapa": ["sapa"],
};

// Fallback — hezké zformátování textu (První písmeno velké, zbytek malé)
function toTitle(input: string): string {
  const t = (input || "").trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

// Vrátí název skupiny; pokud se neshoduje, vrátí vstup (zformátovaný)
export function mapLocationToGroup(location: string): string {
  const norm = normalizeString(location);
  for (const [group, aliases] of Object.entries(LOCATION_GROUPS)) {
    if (aliases.includes(norm)) {
      return group;
    }
  }
  // žádná shoda — vrať původní text v hezkém tvaru
  return toTitle(location);
}
