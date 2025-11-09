# Gastro Tips - Kompletní dokumentace projektu

## Základní informace
**Název:** Pojď sem! Kam jdeš?
**Produkční URL:** www.pojdsemkamjdes.cz
**Tech stack:** Next.js 15, React 19, Supabase, Tailwind CSS
**Deployment:** Vercel

---

## Struktura projektu

### Stránky (8)

#### Veřejné stránky (5)
1. **Homepage** (`/`) - `app/page.tsx`
   - Zobrazuje trending podniky
   - Quick filtry pro rychlý přístup
   - Seznam všech restaurací s filtrováním

2. **Restaurace v okolí** (`/lokality`) - `app/lokality/page.tsx`
   - Horizontální carousely restaurací podle lokalit
   - Minimálně 3 restaurace na lokalitu
   - Abecední řazení lokalit i restaurací
   - Zachovává původní kapitalizaci lokalit z DB

3. **Světové kuchyně** (`/kuchyne`) - `app/kuchyne/page.tsx`
   - Horizontální carousely restaurací podle typu kuchyně
   - Minimálně 3 restaurace na typ
   - Emoji ikony pro jednotlivé kuchyně (vlajky, jídla)
   - Abecední řazení typů i restaurací

4. **Kavárny** (`/kavarny`) - `app/kavarny/page.tsx`
   - Placeholder stránka - "Brzy"

5. **Gastro akce** (`/akce`) - `app/akce/page.tsx`
   - Placeholder stránka - "Brzy"

#### Admin stránky (3)
6. **Admin Dashboard** (`/admin`) - `app/admin/page.tsx`
   - Přehled restaurací a trending podniků
   - CRUD operace pro restaurace
   - CRUD operace pro trending podniky
   - Drag & drop řazení trendings
   - Import CSV tlačítko
   - Logout tlačítko

7. **Admin Login** (`/admin/login`) - `app/admin/login/page.tsx`
   - Jednoduchá heslo-based autentizace
   - Cookie-based session (7 dní)

8. **CSV Import** (`/admin/import`) - `app/admin/import/page.tsx`
   - Hromadný import restaurací z CSV
   - Upsert logika (aktualizuje existující, vytváří nové)
   - Zachovává image_url, website_url, addresses při importu

---

## Komponenty (12)

### Veřejné komponenty
1. **Logo** (`components/Logo.tsx`)
   - Animované SVG logo
   - Používá se napříč stránkami

2. **HamburgerMenu** (`components/HamburgerMenu.tsx`)
   - Navigační sidebar menu
   - Skryté na admin stránkách
   - 4 položky menu + link na Instagram

3. **RestaurantCard** (`components/RestaurantCard.tsx`)
   - Zobrazení jedné restaurace
   - Fotka, název, lokality s adresami
   - Typ kuchyně, cena range, hodnocení
   - Google Maps link pro adresy
   - Web/Instagram link

4. **TrendingCard** (`components/TrendingCard.tsx`)
   - Karta pro trending podnik
   - Fotka, název, adresa, web link

5. **RestaurantFilter** (`components/RestaurantFilter.tsx`)
   - Filtry podle lokality a typu kuchyně
   - Podporuje hierarchii typů kuchyní

6. **QuickFilters** (`components/QuickFilters.tsx`)
   - Rychlé filtry na homepage
   - Přednastavené kombinace filtrů

### Admin komponenty
7. **AdminDashboard** (`components/AdminDashboard.tsx`)
   - Správa restaurací
   - Tlačítko "Přidat restauraci"
   - Seznam s edit/delete akcemi

8. **RestaurantForm** (`components/RestaurantForm.tsx`)
   - Formulář pro přidání/editaci restaurace
   - React Hook Form + Zod validace
   - Auto-fetch fotek z Google Places API
   - Výběr z galerie fotek (až 10)
   - Editovatelné JSON pole pro adresy

9. **TrendingsAdmin** (`components/TrendingsAdmin.tsx`)
   - Správa trending podniků
   - Drag & drop řazení (dnd-kit)
   - Tlačítko "Přidat trending"
   - Seznam s edit/delete akcemi

10. **TrendingForm** (`components/TrendingForm.tsx`)
    - Formulář pro přidání/editaci trending podniku
    - React Hook Form + Zod validace
    - Auto-fetch fotek z Google Places API

11. **ImportForm** (`components/ImportForm.tsx`)
    - CSV upload a import
    - Náhled dat před importem
    - Bulk upsert do databáze

12. **LogoutButton** (`components/LogoutButton.tsx`)
    - Tlačítko pro odhlášení z adminu

---

## API Routes (11)

### Autentizace (2)
1. **POST `/api/auth/login`**
   - Input: `{ password: string }`
   - Output: `{ success: boolean }`
   - Nastaví HTTP-only cookie

2. **POST `/api/auth/logout`**
   - Smaže auth cookie

### Restaurace (4)
3. **GET `/api/restaurants`**
   - Query params: `location`, `cuisineType`
   - Output: `Restaurant[]`
   - Filtrování podle lokality/typu

4. **GET `/api/restaurants/filters`**
   - Output: `{ locations: string[], cuisineTypes: string[] }`
   - Unikátní lokality a typy kuchyní z DB

5. **GET `/api/restaurants/:id`**
   - Output: `Restaurant`

6. **PATCH `/api/restaurants/:id`**
   - Input: `RestaurantInput`
   - Output: `Restaurant`

### Trending (2)
7. **GET `/api/trendings`**
   - Output: `Trending[]`
   - Seřazené podle display_order

8. **PATCH `/api/trendings/:id`**
   - Input: `TrendingInput`
   - Output: `Trending`

### Import (1)
9. **POST `/api/import`**
   - Input: CSV data
   - Output: `{ count: number }`
   - Bulk upsert restaurací

### Google Places Integration (1)
10. **GET `/api/places/photo`**
    - Query: `name`, `location` (comma-separated)
    - Output: `{ photoUrl, photoUrls[], addresses }`
    - Vrací až 10 fotek z Google Places
    - Mapuje adresy podle lokalit

### Admin Utilities (2)
11. **POST `/api/admin/fetch-all-photos`**
    - Automaticky stáhne fotky pro všechny restaurace

12. **POST `/api/admin/fetch-all-addresses`**
    - Automaticky stáhne adresy pro všechny restaurace

---

## Databázové modely

### Restaurant
```typescript
{
  id: number;
  name: string;
  location: string; // comma-separated: "Anděl, Letná, Vinohrady"
  addresses: Record<string, string> | null; // {"Anděl": "Nádražní 2, Praha 5"}
  cuisine_type: string; // comma-separated: "italská, pizza"
  specialty: string | null;
  price: number; // průměrná cena za osobu
  rating: number; // 1-10
  website_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}
```

**Validace (Zod):**
- name: min 1 char
- location: min 1 char
- addresses: optional JSON object
- cuisine_type: min 1 char
- price: >= 0
- rating: 1-10
- website_url: valid URL or empty
- image_url: valid URL or empty

### Trending
```typescript
{
  id: number;
  name: string;
  address: string | null;
  website_url: string | null;
  image_url: string | null;
  display_order: number; // pro drag & drop řazení
  created_at: string;
  updated_at: string;
}
```

---

## Klíčové funkcionality

### 1. Multi-lokace podpora
Restaurace mohou mít více poboček:
- V DB: `location: "Anděl, Letná, Vinohrady"`
- V UI: zobrazují se jako 3 samostatné karty
- Addresses JSON mapuje lokality na adresy
- Case-insensitive matching lokalit s adresami

### 2. Google Places API integrace
- Auto-fetch fotek a adres
- Text Search API pro nalezení místa
- Vrací až 10 fotek na výběr
- Delay 200ms mezi requesty (rate limiting)
- API key na serveru (bezpečné)

### 3. CSV Import
- Bulk upsert (update existující, create nové)
- Zachovává URLs a adresy při update
- Validace před importem
- Preview dat

### 4. Drag & Drop Trendings
- dnd-kit library
- Persistuje display_order do DB
- Smooth animace

### 5. Emoji mappings pro kuchyně
- Vlajky národností: 🇮🇹 🇨🇿 🇲🇽 atd.
- Specifická jídla: 🍕 🍔 🍣
- Normalizace diakritiky pro matching
- Fallback: 🍽️

### 6. Cena range badges
Podle průměrné ceny:
- 💰 (< 300 Kč)
- 💰💰 (300-700 Kč)
- 💰💰💰 (> 700 Kč)

### 7. Autentizace
- Cookie-based (7 dní expiry)
- HTTP-only, Secure v produkci
- Heslo z ENV variable
- Middleware ochrana admin routes

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Google Places API
GOOGLE_PLACES_API_KEY=xxx

# Admin autentizace
ADMIN_PASSWORD=xxx
```

---

## Styling

### Tailwind CSS
- Gradient backgrounds: `from-black via-gray-900 to-black`
- Purple accent color: `purple-400`, `purple-500`, `purple-600`
- Card shadows: `shadow-xl`, `shadow-2xl`
- Borders: `border-purple-500/30`

### Custom CSS
- Horizontal scroll carousels s thin scrollbar
- Animace pro Logo component

---

## Deployment

### Vercel
- Auto-deploy z GitHub (main branch)
- Environment variables v Vercel dashboard
- Custom domain: www.pojdsemkamjdes.cz
- DNS: Active24 (A records + CNAME)

### Build
```bash
npm run build
```

### Dev
```bash
npm run dev
```

---

## Data Flow

### Homepage Load
1. Server fetch: `getAllRestaurants()`, `getAllTrendings()`
2. Client hydration
3. User interakce: Filtry (client-side)

### Admin CRUD
1. User submit form
2. API route validation (Zod)
3. Supabase upsert
4. Revalidate page / refresh data

### Google Places Fetch
1. User klikne "Auto-fetch"
2. Frontend → `/api/places/photo`
3. Backend → Google Text Search API
4. Parse results (až 10 fotek)
5. Return photoUrls + addresses
6. Frontend zobrazí galerii
7. User vybere fotku

---

## Budoucí features (placeholder stránky)
- Kavárny sekce
- Gastro akce sekce
- Možné features:
  - Push notifikace (nové restaurace)
  - GPS lokace (restaurace poblíž)
  - Offline mode
  - Recenze uživatelů
  - Rezervace

---

*Dokumentace vytvořena: 9.11.2025*
*Poslední update: 9.11.2025*
