import { Locale } from "./LocaleContext";

function pluralCs(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

export const dictionaries = {
  cs: {
    nav: {
      restaurants: "Restaurace",
      cafes: "Kavárny",
      nearby: "Okolí",
      events: "Akce",
    },
    logo: {
      tagline: "Pojď sem! Kam jdeš?",
    },
    home: {
      heroTitle: "Objevuj nejlepší gastro místa v Praze",
      heroSubtitlePrefix: "Osobní doporučení od",
      sectionTitle: "Nejlepší restaurace v Praze",
      sectionSubtitle: "Filtruj podle lokality, typu kuchyně nebo najdi restauraci ve svém okolí",
      sortLabel: "Seřadit:",
      sortRating: "Podle hodnocení",
      sortPrice: "Podle ceny",
      sortName: "Podle názvu",
      count: (n: number) => `Nalezeno ${n} ${pluralCs(n, "restauraci", "restaurace", "restaurací")}`,
      emptyTitle: "Nebyly nalezeny žádné restaurace",
      resetFilters: "Resetovat filtry",
    },
    kavarny: {
      title: "Kavárny v Praze",
      subtitlePrefix: "Nejlepší kavárny v Praze od",
      categoryLabel: "Kategorie:",
      tagAll: "Všechny",
      tagDezert: "Dezert",
      tagMatcha: "Matcha",
      tagSnidane: "Snídaně",
      tagTopKava: "TOP káva",
      allLocations: "Všechny lokality",
      reset: "Zrušit",
      count: (n: number) => `Nalezeno ${n} ${pluralCs(n, "kavárnu", "kavárny", "kaváren")}`,
      emptyTitle: "Nebyly nalezeny žádné kavárny",
    },
    recentVisits: {
      heading: "✨ Nejnovější návštěvy",
      subtitle: "Moje poslední návštěvy restaurací a kaváren",
      prevAria: "Předchozí návštěva",
      nextAria: "Další návštěva",
    },
    filter: {
      allLocations: "Všechny lokality",
      allCuisineTypes: "Všechny typy",
      reset: "Zrušit",
    },
    quickFilters: {
      heading: "Rychlé filtry",
    },
    visitCard: {
      moreDishes: (n: number) => `+${n} další`,
    },
    common: {
      nearMe: "V mém okolí",
      resetFilters: "Resetovat filtry",
      priceUnspecified: "Cena neuvedena",
      priceUnder: (v: number) => `Do ${v} Kč`,
      priceRange: (a: number, b: number) => `${a}-${b} Kč`,
      priceOver: (v: number) => `${v}+ Kč`,
    },
  },
  en: {
    nav: {
      restaurants: "Restaurants",
      cafes: "Cafes",
      nearby: "Nearby",
      events: "Events",
    },
    logo: {
      tagline: "Pojď sem! Kam jdeš?",
    },
    home: {
      heroTitle: "Discover the best food spots in Prague",
      heroSubtitlePrefix: "Personal recommendations from",
      sectionTitle: "Best restaurants in Prague",
      sectionSubtitle: "Filter by location, cuisine type, or find a restaurant near you",
      sortLabel: "Sort by:",
      sortRating: "Rating",
      sortPrice: "Price",
      sortName: "Name",
      count: (n: number) => `Found ${n} ${n === 1 ? "restaurant" : "restaurants"}`,
      emptyTitle: "No restaurants found",
      resetFilters: "Reset filters",
    },
    kavarny: {
      title: "Cafes in Prague",
      subtitlePrefix: "The best cafes in Prague from",
      categoryLabel: "Category:",
      tagAll: "All",
      tagDezert: "Dessert",
      tagMatcha: "Matcha",
      tagSnidane: "Breakfast",
      tagTopKava: "Top-tier coffee",
      allLocations: "All locations",
      reset: "Clear",
      count: (n: number) => `Found ${n} ${n === 1 ? "cafe" : "cafes"}`,
      emptyTitle: "No cafes found",
    },
    recentVisits: {
      heading: "✨ Latest visits",
      subtitle: "My most recent restaurant and cafe visits",
      prevAria: "Previous visit",
      nextAria: "Next visit",
    },
    filter: {
      allLocations: "All locations",
      allCuisineTypes: "All types",
      reset: "Clear",
    },
    quickFilters: {
      heading: "Quick filters",
    },
    visitCard: {
      moreDishes: (n: number) => `+${n} more`,
    },
    common: {
      nearMe: "Near me",
      resetFilters: "Reset filters",
      priceUnspecified: "Price not listed",
      priceUnder: (v: number) => `Under ${v} CZK`,
      priceRange: (a: number, b: number) => `${a}-${b} CZK`,
      priceOver: (v: number) => `${v}+ CZK`,
    },
  },
} satisfies Record<Locale, unknown>;

export type Dictionary = typeof dictionaries.cs;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] as Dictionary;
}

// Cuisine type labels are free Czech words typed by the site owner (29
// distinct values today), not a machine-translated DB field - a small
// static map is more reliable than an API call for a fixed vocabulary
// this size, and needs no DB migration.
const CUISINE_EN: Record<string, string> = {
  "all you can eat": "all you can eat",
  "americká": "American",
  "argentinská": "Argentinian",
  "asijská": "Asian",
  "belgická": "Belgian",
  "bistro": "bistro",
  "britská": "British",
  "burger": "burgers",
  "degustační": "tasting menu",
  "empanadas": "empanadas",
  "indická": "Indian",
  "italská": "Italian",
  "japonská": "Japanese",
  "kanadská": "Canadian",
  "korejská": "Korean",
  "maso": "meat",
  "mexická": "Mexican",
  "mořské plody": "seafood",
  "pizza": "pizza",
  "ramen": "ramen",
  "slovenská": "Slovak",
  "sushi": "sushi",
  "tapas": "tapas",
  "venezuelská": "Venezuelan",
  "vietnamská": "Vietnamese",
  "česká": "Czech",
  "čínská": "Chinese",
  "řecká": "Greek",
  "španělská": "Spanish",
};

export function translateCuisineType(cuisineType: string, locale: Locale): string {
  if (locale === "cs") return cuisineType;
  return cuisineType
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      return CUISINE_EN[trimmed.toLowerCase()] || trimmed;
    })
    .join(", ");
}

export function formatPrice(price: number, locale: Locale): string {
  const t = getDictionary(locale).common;
  if (price === 0) return t.priceUnspecified;
  if (price < 500) return t.priceUnder(500);
  if (price < 1000) return t.priceRange(500, 1000);
  if (price < 2000) return t.priceRange(1000, 2000);
  return t.priceOver(2000);
}
