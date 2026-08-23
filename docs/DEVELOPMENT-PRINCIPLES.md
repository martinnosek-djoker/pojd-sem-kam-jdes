# Development Principles - Pojď sem! Kam jdeš?

## Core Principle: No-Rebuild-Needed ✅

**Základní princip:** Aplikace musí **vždy fungovat optimálně i bez rebuildu**.

### Co to znamená:

1. **Nový content = okamžitá dostupnost**
   - Nová restaurace, kavárna → funguje ihned po přidání do DB
   - Uživatel vidí nový content bez čekání na deploy

2. **Build = optimalizace, ne requirement**
   - Build stahuje obrázky offline → rychlejší načítání
   - Build generuje statické stránky → lepší performance
   - **ALE základní funkčnost funguje i bez buildu**

3. **Smart fallback systémy**
   - 404 detekuje content URLs → načte z API
   - Missing images → fallback na Supabase URL
   - Cache miss → real-time API call

### Jak to implementovat:

#### ✅ DO - Správný přístup:

```typescript
// Client component s dynamic loading
function Page({ initialData }: { initialData?: Data }) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    // Pokud není initialData, načti z API
    if (!initialData) {
      fetchFromAPI();
    }
  }, [initialData]);
}
```

```typescript
// Server component s optional static generation
export async function generateStaticParams() {
  // Generuj pouze pro existující v cache
  if (process.env.MOBILE_BUILD) {
    return existingItems.map(...);
  }
  return [];
}

// DŮLEŽITÉ: Povol dynamické params
export const dynamicParams = true;
```

```typescript
// Smart 404 fallback
export default function NotFound() {
  const pathname = usePathname();

  // Detekuj content URL
  if (pathname.startsWith('/restaurants/')) {
    // Načti z API a zobraz
    return <DynamicRestaurantPage />;
  }
}
```

#### ❌ DON'T - Špatný přístup:

```typescript
// ❌ Pouze statická data bez fallbacku
function Page() {
  const data = staticData; // Co když data nejsou?
  return <div>{data.name}</div>; // Crash!
}
```

```typescript
// ❌ Zakázané dynamické params
export const dynamicParams = false; // Nové URLs = 404!
```

```typescript
// ❌ Hard-coded paths bez API fallbacku
// Nový content nebude nikdy fungovat
```

### Checklist před každou feature:

- [ ] Funguje bez buildu?
- [ ] Má API fallback pro nová data?
- [ ] Podporuje `dynamicParams = true`?
- [ ] Má smart 404 fallback pro new URLs?
- [ ] Cache je optional, ne required?

## Architecture Overview

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Mobile:** Capacitor 7
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel (web) + Google Play (mobile)
- **Storage:** Supabase Storage (images)

### Build Modes

1. **Web Build** (`next build`)
   - Server-side rendering
   - Dynamic API routes
   - Real-time data

2. **Mobile Build** (`npm run build:mobile`)
   - Static export (`output: 'export'`)
   - Offline-first
   - Cached data + smart fallbacks

## Recent Updates (Last 2 Months)

### Homepage Design Overhaul (Jan 2026)

#### Before:
- Jednoduchý seznam restaurací
- Základní layout
- Minimální navigace

#### After:
- **Hero sekce** s brand identity
- **Quick navigation** do sekcí (Restaurace, Kavárny, Cukrárny, Trendy)
- **Gradient design** - purple/black theme
- **Responsive layout** - mobile-first

**Soubory:**
- `components/HomePage.tsx` - Hlavní homepage komponenta
- `app/page.tsx` - Root page

### Bottom Navigation Redesign (Feb 2026)

#### Before:
- 3 items (Domů, Poblíž, Akce)
- Jednoduchý design
- Bez aktivního stavu

#### After:
- **5 items** rozšířená navigace:
  1. **Domů** (Home icon) - Homepage
  2. **Restaurace** (Utensils icon) - Seznam restaurací
  3. **Kavárny** (Coffee icon) - Seznam kaváren
  4. **Poblíž** (Map Pin icon) - Geolokace
  5. **Akce** (Calendar icon) - Gastro události

- **Aktivní stav** s purple barvou
- **Smooth transitions**
- **Touch-friendly** - větší hit areas

**Soubor:** `components/BottomNavigation.tsx`

```typescript
const items = [
  { href: '/', icon: Home, label: 'Domů' },
  { href: '/kuchyne', icon: Utensils, label: 'Restaurace' },
  { href: '/kavarny', icon: Coffee, label: 'Kavárny' },
  { href: '/pobliz', icon: MapPin, label: 'Poblíž' },
  { href: '/akce', icon: Calendar, label: 'Akce' },
];
```

### Database Schema Updates

#### Cafes Table
```sql
CREATE TABLE cafes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  addresses JSONB,
  coordinates JSONB,
  website_url TEXT,
  image_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Component Structure

### Pages

```
app/
├── page.tsx                    # Homepage
├── layout.tsx                  # Root layout (Bottom nav, handlers)
├── not-found.tsx              # 404 page
├── kavarny/page.tsx           # Cafes list
├── kuchyne/page.tsx           # Restaurants list
├── cukrarny/page.tsx          # Bakeries list
├── trendy/page.tsx            # Trending places
├── pobliz/page.tsx            # Nearby (geolocation)
├── akce/page.tsx              # Events
├── michelin/page.tsx          # Michelin guide
└── lokality/page.tsx          # Locations
```

### Key Components

```
components/
├── HomePage.tsx               # Homepage
├── BottomNavigation.tsx       # Spodní navigace (5 items)
├── CafeCard.tsx              # Cafe card
├── RestaurantCard.tsx        # Restaurant card
├── BackButtonHandler.tsx     # Android back button
├── PushNotificationHandler.tsx  # Push notifikace
├── ScrollToTop.tsx           # Auto scroll top
└── Logo.tsx                  # Brand logo komponenta
```

## Mobile-Specific Features

### Android Back Button

```typescript
// components/BackButtonHandler.tsx
App.addListener("backButton", () => {
  const isHomepage = window.location.pathname === "/";
  const hasHistory = window.history.length > 1;

  if (!isHomepage && hasHistory) {
    router.back(); // Navigate back
  } else if (isHomepage) {
    App.minimizeApp(); // Minimize instead of exit
  } else {
    router.push("/"); // Fallback to homepage
  }
});
```

### Push Notifications

```typescript
// components/PushNotificationHandler.tsx
// Registrace FCM tokenu
// Přijímání notifikací
// Handling notification tap
```

## API Structure

### Supabase Configuration

```typescript
// lib/db.ts
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### API Routes (Mobile: Excluded)

```
app/api/
├── restaurants/
│   ├── route.ts              # GET /api/restaurants
│   ├── [id]/route.ts         # GET /api/restaurants/:id
│   └── filters/route.ts      # GET /api/restaurants/filters
├── cafes/
│   ├── route.ts              # GET /api/cafes
│   ├── [id]/route.ts         # GET /api/cafes/:id
│   └── filters/route.ts      # GET /api/cafes/filters
├── bakeries/...
└── events/...
```

## Styling & Design System

### Color Palette

```css
/* Primary */
--purple-400: #c084fc
--purple-500: #a78bfa
--purple-600: #9333ea
--purple-900: #581c87

/* Backgrounds */
--black: #000000
--gray-900: #111827
--gray-800: #1f2937

/* Gradients */
from-black via-gray-900 to-black
from-purple-900/20 via-gray-900/50 to-black
```

### Typography

```css
/* Headlines */
text-4xl font-bold  /* 2.25rem / 36px */
text-3xl font-bold  /* 1.875rem / 30px */
text-2xl font-bold  /* 1.5rem / 24px */

/* Body */
text-lg  /* 1.125rem / 18px */
text-base  /* 1rem / 16px */
text-sm  /* 0.875rem / 14px */
```

### Spacing

```css
/* Page padding */
px-4 sm:px-8  /* 16px mobile, 32px desktop */
py-8  /* 32px vertical */
pb-20  /* Bottom nav clearance */

/* Card gaps */
gap-6  /* 24px */
gap-4  /* 16px */
```

## Build & Deploy Workflow

### Version Bump

```bash
# Android version codes
android/app/build.gradle:
versionCode 17  # Integer, increment každý release
versionName "1.17.0"  # Semantic versioning
```

### Build Commands

```bash
# Web development
npm run dev

# Mobile development
npm run build:mobile  # Full build + AAB
npm run cap:android   # Open Android Studio
```

### AAB Generation

```bash
# Build AAB v Android Studio
cd android
./gradlew bundleRelease

# Output
android/app/build/outputs/bundle/release/app-release.aab

# Copy to Desktop
cp android/app/build/outputs/bundle/release/app-release.aab ~/Desktop/
```

## Testing Checklist

### Before Release

- [ ] Test na skutečném Android zařízení
- [ ] Zkontroluj všechny sekce (Domů, Restaurace, Kavárny, Poblíž, Akce)
- [ ] Test back button behavior
- [ ] Test offline mode (airplane mode)
- [ ] Verify image loading
- [ ] Check push notifications

### Content Updates

- [ ] Přidej restauraci → Proklik funguje? ✅
- [ ] Refresh stránky → Smart fallback funguje? ✅
- [ ] Fotky se načítají? ✅

## Common Issues & Solutions

### Issue: Nový content nefunguje
**Root cause:** Missing API fallback
**Solution:** Implementuj smart 404 + dynamic loading

### Issue: Build fails
**Root cause:** API routes v mobile buildu
**Solution:** Zkontroluj `scripts/prepare-mobile-build.mjs`

### Issue: AAB signing error
**Root cause:** Missing/expired keystore
**Solution:** Check `android/app/build.gradle` signing config

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Contributing

1. Vždy implementuj no-rebuild princip
2. Testuj na skutečném zařízení
3. Dokumentuj změny v této dokumentaci
4. Bump version před releasem
