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
    loading: {
      cooking: "Vaříme pro vás...",
      loadingData: "Načítání dat",
    },
    common: {
      nearMe: "V mém okolí",
      resetFilters: "Resetovat filtry",
      priceUnspecified: "Cena neuvedena",
      priceUnder: (v: number) => `Do ${v} Kč`,
      priceRange: (a: number, b: number) => `${a}-${b} Kč`,
      priceOver: (v: number) => `${v}+ Kč`,
      restaurantCount: (n: number) => `${n} ${pluralCs(n, "restaurace", "restaurace", "restaurací")}`,
    },
    cukrarny: {
      title: "Cukrárny a pekárny v Praze",
      subtitlePrefix: "Nejlepší cukrárny v Praze od",
      count: (n: number) => `Nalezeno ${n} ${pluralCs(n, "cukrárnu", "cukrárny", "cukráren")}`,
      emptyTitle: "Nebyly nalezeny žádné cukrárny",
    },
    kuchyne: {
      title: "Světové kuchyně",
      subtitle: "Najdi nejlepší restaurace podle typu kuchyně",
      emptyTitle: "Nebyly nalezeny žádné kuchyně",
    },
    lokality: {
      title: "Podle lokality",
      subtitle: "Nejlepší restaurace v Praze roztříděné podle lokality",
      emptyTitle: "Nebyly nalezeny žádné lokality s dostatečným počtem restaurací",
    },
    trendy: {
      title: "🔥 TOP 10 trendů",
      subtitlePrefix: "Nejžhavější tipy v pražské gastronomii od",
      emptyTitle: "Momentálně nejsou k dispozici žádné trendy",
    },
    akce: {
      title: "Gastro akce",
      subtitle: "Nejlepší gastro akce v Praze a okolí",
      emptyTitle: "Momentálně nejsou k dispozici žádné akce",
    },
    pobliz: {
      title: "Restaurace v okolí",
      subtitle: "Najdi skvělá místa poblíž tvé polohy",
      modeGps: "📍 Moje poloha",
      modeAddress: "🔍 Hledat adresu",
      gettingLocation: "Zjišťuji polohu...",
      updateLocation: "Aktualizovat polohu",
      findNearby: "Najít restaurace v okolí",
      addressPlaceholder: "např. Václavské náměstí, Praha",
      search: "Hledat",
      addressHint: "Zadej adresu, ulici, náměstí nebo městskou část",
      addressRequired: "Zadej prosím adresu nebo místo",
      radiusLabel: "Poloměr hledání:",
      foundAddressLabel: "📍 Vyhledaná adresa:",
      yourLocation: (lat: string, lng: string) => `Tvá poloha: ${lat}, ${lng}`,
      errorPermissionTitle: "Přístup k poloze není povolen",
      errorGenericTitle: "Nepodařilo se získat tvou polohu",
      howToAllow: "Jak povolit přístup k poloze:",
      webInstructionsTitle: "🌐 Na webu (Chrome, Safari, Firefox)",
      webStep1: "Klikni na zámek 🔒 nebo info ikonu ⓘ vlevo od URL v horní liště",
      webStep2: "Najdi nastavení „Poloha“",
      webStep3: "Vyber „Povolit“",
      webStep4: "Stránka se může obnovit – klikni znovu na tlačítko níže",
      mobileInstructionsTitle: "📱 V mobilní aplikaci",
      mobileIphone: "iPhone: Nastavení → Soukromí → Polohové služby → Gastro Tips → Povolit",
      mobileAndroid: "Android: Nastavení → Aplikace → Gastro Tips → Oprávnění → Poloha → Povolit",
      whatToTryTitle: "Co zkusit:",
      tryTip1: "Zkontroluj, že máš zapnutou GPS na zařízení",
      tryTip2: "Zkus se přesunout blíž k oknu (lepší GPS signál)",
      tryTip3: "Zkus to za chvíli znovu",
      retryPermission: "Zkusit povolit znovu",
      retryGeneric: "Zkusit znovu",
      enterAddressManually: "🔍 Zadat adresu ručně",
      emptyPromptTitle: "Použij svou GPS polohu nebo vyhledej adresu",
      emptyPromptSubtitle: "Najdeme ti nejbližší restaurace, kavárny a cukrárny",
      noResultsInRadius: (km: number) => `V okruhu ${km} km nenalezena žádná místa`,
      tryLargerRadius: "Zkus zvětšit poloměr hledání",
      expandTo: (km: number) => `Zvětšit na ${km} km`,
      resultsCount: (n: number, km: number) =>
        `Nalezeno ${n} ${pluralCs(n, "místo", "místa", "míst")} v okruhu ${km} km`,
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
    loading: {
      cooking: "Cooking for you...",
      loadingData: "Loading data",
    },
    common: {
      nearMe: "Near me",
      resetFilters: "Reset filters",
      priceUnspecified: "Price not listed",
      priceUnder: (v: number) => `Under ${v} CZK`,
      priceRange: (a: number, b: number) => `${a}-${b} CZK`,
      priceOver: (v: number) => `${v}+ CZK`,
      restaurantCount: (n: number) => `${n} ${n === 1 ? "restaurant" : "restaurants"}`,
    },
    cukrarny: {
      title: "Bakeries in Prague",
      subtitlePrefix: "The best bakeries in Prague from",
      count: (n: number) => `Found ${n} ${n === 1 ? "bakery" : "bakeries"}`,
      emptyTitle: "No bakeries found",
    },
    kuchyne: {
      title: "World Cuisines",
      subtitle: "Find the best restaurants by cuisine type",
      emptyTitle: "No cuisines found",
    },
    lokality: {
      title: "By Location",
      subtitle: "The best restaurants in Prague sorted by neighborhood",
      emptyTitle: "No locations with enough restaurants found",
    },
    trendy: {
      title: "🔥 TOP 10 Trends",
      subtitlePrefix: "The hottest tips in Prague's food scene from",
      emptyTitle: "No trends available right now",
    },
    akce: {
      title: "Food Events",
      subtitle: "The best food events in and around Prague",
      emptyTitle: "No events available right now",
    },
    pobliz: {
      title: "Restaurants Nearby",
      subtitle: "Find great places near your location",
      modeGps: "📍 My location",
      modeAddress: "🔍 Search address",
      gettingLocation: "Getting your location...",
      updateLocation: "Update location",
      findNearby: "Find restaurants nearby",
      addressPlaceholder: "e.g. Wenceslas Square, Prague",
      search: "Search",
      addressHint: "Enter an address, street, square or neighborhood",
      addressRequired: "Please enter an address or place",
      radiusLabel: "Search radius:",
      foundAddressLabel: "📍 Address found:",
      yourLocation: (lat: string, lng: string) => `Your location: ${lat}, ${lng}`,
      errorPermissionTitle: "Location access not allowed",
      errorGenericTitle: "Couldn't get your location",
      howToAllow: "How to allow location access:",
      webInstructionsTitle: "🌐 On the web (Chrome, Safari, Firefox)",
      webStep1: "Click the lock icon 🔒 or info icon ⓘ to the left of the URL in the address bar",
      webStep2: "Find the \"Location\" setting",
      webStep3: "Select \"Allow\"",
      webStep4: "The page may reload — click the button below again",
      mobileInstructionsTitle: "📱 In the mobile app",
      mobileIphone: "iPhone: Settings → Privacy → Location Services → Gastro Tips → Allow",
      mobileAndroid: "Android: Settings → Apps → Gastro Tips → Permissions → Location → Allow",
      whatToTryTitle: "What to try:",
      tryTip1: "Check that GPS is turned on for your device",
      tryTip2: "Try moving closer to a window (better GPS signal)",
      tryTip3: "Try again in a moment",
      retryPermission: "Try allowing again",
      retryGeneric: "Try again",
      enterAddressManually: "🔍 Enter address manually",
      emptyPromptTitle: "Use your GPS location or search an address",
      emptyPromptSubtitle: "We'll find the nearest restaurants, cafes and bakeries",
      noResultsInRadius: (km: number) => `No places found within ${km} km`,
      tryLargerRadius: "Try expanding the search radius",
      expandTo: (km: number) => `Expand to ${km} km`,
      resultsCount: (n: number, km: number) =>
        `Found ${n} ${n === 1 ? "place" : "places"} within ${km} km`,
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

const MONTHS_CS = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Deliberately not Date.toLocaleDateString(): its output can differ between
// Node's ICU (server) and the browser's Intl (client) for the exact same
// locale/options, which breaks hydration once a date renders in the initial
// server HTML. Also reads UTC fields so the calendar day can't shift between
// the server's timezone and the visitor's.
export function formatLongDate(dateString: string, locale: Locale): string {
  const d = new Date(dateString);
  const day = d.getUTCDate();
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();
  return locale === "en" ? `${MONTHS_EN[month]} ${day}, ${year}` : `${day}. ${MONTHS_CS[month]} ${year}`;
}

export function formatPrice(price: number, locale: Locale): string {
  const t = getDictionary(locale).common;
  if (price === 0) return t.priceUnspecified;
  if (price < 500) return t.priceUnder(500);
  if (price < 1000) return t.priceRange(500, 1000);
  if (price < 2000) return t.priceRange(1000, 2000);
  return t.priceOver(2000);
}
