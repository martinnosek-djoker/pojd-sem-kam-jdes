# Systém Recenzí - Dokumentace

## Přehled

Systém recenzí umožňuje zobrazovat podrobné recenze restaurací a kaváren s dynamickým načítáním, které **funguje i bez rebuildu aplikace**.

## Architektura

### Klíčový princip: No-Rebuild-Needed ✅

Systém je navržen tak, aby nové recenze fungovaly okamžitě po přidání do databáze, **bez potřeby rebuildu**:

1. **Client-side navigace** (`<Link>`) - Vždy funguje
2. **Direct links / Refresh** - Smart 404 fallback načte z API
3. **Build optimalizace** - Pouze pro performance (offline cache, obrázky)

## Komponenty

### 1. Review Detail Page (`app/recenze/[slug]/page.tsx`)

**Server Component** - Generuje statické stránky při buildu pro existující recenze.

```typescript
export async function generateStaticParams() {
  if (process.env.MOBILE_BUILD) {
    const cacheFile = join(process.cwd(), '.reviews-cache.json');
    const reviews = JSON.parse(readFileSync(cacheFile, 'utf-8'));

    return reviews.map((review: any) => ({
      slug: createReviewSlug(review.id, review.restaurant?.name || review.cafe?.name || "review"),
    }));
  }
  return [];
}
```

**Klíčové vlastnosti:**
- `dynamicParams: true` - Povoluje dynamické parametry
- Načítá data ze `.reviews-cache.json` při buildu
- Předává `initialReview` do client komponenty

### 2. Review Detail Component (`app/recenze/[slug]/ReviewDetail.tsx`)

**Client Component** - Zobrazuje detail recenze s dynamickým načítáním.

```typescript
export default function ReviewDetailPage({ initialReview }: ReviewDetailPageProps) {
  const [review, setReview] = useState<Review | null>(initialReview || null);
  const [loading, setLoading] = useState(!initialReview);

  useEffect(() => {
    // Pokud není initialReview, načti z API
    if (!initialReview) {
      fetchReview();
    }
  }, [initialReview]);
}
```

**Funkce:**
- Zobrazuje detail recenze s fotkami, hodnocením, jídly
- Podporuje image gallery (thumbnails + main image)
- Načítá podobné podniky (restaurace + kavárny)
- **Dynamicky načítá data z API** pokud není initialReview

### 3. Smart 404 Fallback (`app/not-found.tsx`)

**Client Component** - Inteligentní 404 stránka pro nové recenze.

```typescript
export default function NotFound() {
  const pathname = usePathname();
  const [review, setReview] = useState<Review | null>(null);

  useEffect(() => {
    // Detekuje /recenze/* URL
    if (pathname && pathname.startsWith('/recenze/')) {
      const slug = pathname.replace('/recenze/', '').replace(/\/$/, '');

      // Načte recenzi z API
      const reviewId = getReviewIdFromSlug(slug);
      const res = await fetch(getApiUrl(`/api/reviews/${reviewId}`));
      const data = await res.json();
      setReview(data);
    }
  }, [pathname]);

  // Zobrazí ReviewDetailPage pokud byla recenze načtena
  if (isReviewPage && review) {
    return <ReviewDetailPage initialReview={review} />;
  }
}
```

**Jak funguje:**
1. Next.js nenajde statickou stránku → vrátí 404
2. `not-found.tsx` detekuje že URL je `/recenze/*`
3. Extrahuje ID ze slugu (např. `17-neapolis` → ID 17)
4. Načte recenzi z Supabase API
5. Zobrazí stejnou `ReviewDetail` komponentu

## Tok dat

### Scenario 1: Existující recenze (v cache)
```
Build → generateStaticParams() → vytvoří /out/recenze/16-pleiku-coffee/index.html
User klikne → Statická stránka → Okamžité zobrazení ✅
```

### Scenario 2: Nová recenze (není v cache)
```
User klikne Link → Client-side routing → ReviewDetail načte z API ✅
User refreshne → 404 → not-found.tsx detekuje → Načte z API ✅
Direct link → 404 → not-found.tsx detekuje → Načte z API ✅
```

## Slug System

### Vytváření slugu (`lib/slug.ts`)

```typescript
export function createReviewSlug(id: number, name: string): string {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/[áä]/g, 'a')
    .replace(/[éěë]/g, 'e')
    // ... další znaky
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/[-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${id}-${normalized}`;
}
```

**Příklad:** `17-neapolis`, `16-pleiku-coffee`

### Extrakce ID ze slugu

```typescript
export function getReviewIdFromSlug(slug: string): number | null {
  const id = parseInt(slug.split('-')[0], 10);
  return isNaN(id) ? null : id;
}
```

## Image Handling

### Review Images

Obrázky jsou ukládány v `/public/images/reviews/{review_id}/`:
- První obrázek: `{normalized-name}.webp`
- Další obrázky: `{normalized-name}-2.webp`, `{normalized-name}-3.webp`, ...

```typescript
function getReviewImageUrl(imageUrl: string, reviewId: number, restaurantName: string, index: number) {
  if (imageUrl.startsWith('/images/')) return imageUrl;

  if (IS_MOBILE) {
    const normalizedName = restaurantName.toLowerCase()...;
    const fileName = index === 0 ? `${normalizedName}.webp` : `${normalizedName}-${index + 1}.webp`;
    return `/images/reviews/${reviewId}/${fileName}`;
  }

  return getProxiedImageUrl(imageUrl) || imageUrl;
}
```

## Reviews Cache

### Generování cache (`scripts/generate-reviews-data.mjs`)

```javascript
const { data: reviews } = await supabase
  .from('reviews')
  .select(`*, restaurant:restaurants(*), cafe:cafes(*)`)
  .order('display_order', { ascending: true })
  .order('visit_date', { ascending: false });

writeFileSync('.reviews-cache.json', JSON.stringify(reviews, null, 2));
```

**Kdy se generuje:**
- Při každém mobile buildu (`npm run build:mobile`)
- Manuálně: `node scripts/regenerate-reviews-cache.mjs`

## Build Process

### Mobile Build Flow

```bash
npm run build:mobile
```

1. **Prepare** - Vyloučí dynamické API routes
2. **Download Images** - Stáhne obrázky pro offline
3. **Download Review Images** - Stáhne obrázky recenzí
4. **Generate Reviews Cache** - Vytvoří `.reviews-cache.json`
5. **Swap Config** - Přepne na mobile config
6. **Build** - Next.js build s `MOBILE_BUILD=true`
7. **Copy Review Images** - Zkopíruje do `out/images/`
8. **Restore Config** - Vrátí web config
9. **Capacitor Sync** - Synchronizuje s Capacitor

## API Endpoints

### GET `/api/reviews`
Vrací všechny recenze nebo pouze featured.

**Query params:**
- `featured=true` - Pouze featured recenze

### GET `/api/reviews/[id]`
Vrací detail jedné recenze včetně restaurant/cafe dat.

## Database Schema

### Table: `reviews`

```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id),
  cafe_id INTEGER REFERENCES cafes(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  visit_date DATE NOT NULL,
  images TEXT[], -- Array of image URLs
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Ratings
  rating_interior INTEGER,
  rating_service INTEGER,
  rating_food INTEGER,
  overall_rating INTEGER,
  total_spent INTEGER,

  -- Dishes
  dishes JSONB, -- [{ name: string, rating: number }]

  -- Similar places
  similar_restaurant_ids INTEGER[],
  similar_cafe_ids INTEGER[],

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Review Card Component

### Badge System

**"Nová recenze" badge** se zobrazuje 14 dní po `visit_date`:

```typescript
const isNew = (() => {
  const visitDateObj = new Date(review.visit_date);
  const diffMs = Date.now() - visitDateObj.getTime();
  return diffMs / (1000 * 60 * 60 * 24) <= 14;
})();
```

## Best Practices

### ✅ DO:

1. **Vždy používej smart 404 fallback** pro nový content
2. **Cache je optimalizace, ne requirement** - aplikace musí fungovat bez ní
3. **Podporuj offline mode** - kontroluj `IS_MOBILE` pro lokální obrázky
4. **Předávej `initialReview`** z server komponenty pokud je k dispozici

### ❌ DON'T:

1. **Nespoléhej pouze na statické stránky** - nový content musí fungovat hned
2. **Nevynucuj rebuild** pro základní funkčnost
3. **Neukládej absolutní URL** v cache - použij relativní cesty

## Troubleshooting

### Problém: Nová recenze nefunguje
**Řešení:** Zkontroluj že:
1. `dynamicParams: true` v `page.tsx`
2. `not-found.tsx` má správnou detekci `/recenze/*`
3. API endpoint `/api/reviews/[id]` funguje

### Problém: Obrázky se nenačítají
**Řešení:**
1. Web mode: Zkontroluj proxy URL
2. Mobile mode: Spusť `node scripts/download-review-images.mjs`

### Problém: 404 i pro existující recenze
**Řešení:** Rebuild aplikace pro regeneraci cache a statických stránek

## Version History

### v1.17.0 (2026-02-28)
- ✅ Smart 404 fallback pro nové recenze
- ✅ Univerzální systém bez potřeby rebuildu
- ✅ Dokumentace no-rebuild principu

### v1.16.0 (2026-02-23)
- Review badge v cafe cards
- Vylepšený header s back buttonem a logem

### v1.15.0 (2026-02-20)
- Review badge "Nová recenze" (14 dní)
- Image gallery s thumbnails
- Detailed ratings display
