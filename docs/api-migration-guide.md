# API Migration Guide - Web → Hybrid (Web + Mobile)

Tento guide popisuje, jak aktualizovat všechny API calls v projektu, aby fungovaly jak ve web app, tak v mobile app.

---

## Problém

Next.js API routes (`/api/*`) fungují jen když aplikace běží na serveru. V mobile app máme static export (statické HTML/CSS/JS soubory), takže API routes neexistují.

**Řešení:** API routes zůstanou na Vercelu, mobile app se k nim připojí přes HTTPS.

---

## Krok 1: Vytvořit config helper

**Soubor:** `lib/config.ts`

Použít připravený soubor z `docs/configs/lib-config.ts` nebo zkopírovat:

```typescript
export const IS_MOBILE = typeof window !== 'undefined' &&
  (window as any).Capacitor !== undefined;

export const API_BASE_URL = IS_MOBILE
  ? 'https://www.pojdsemkamjdes.cz'
  : '';

export function getApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
}
```

---

## Krok 2: Aktualizovat všechny fetch calls

### Soubory k aktualizaci

Prohledat projekt pro všechny `fetch('/api/` a `fetch(\`/api/`:

```bash
grep -r "fetch.*['\"\`]/api" app/ components/ --include="*.tsx" --include="*.ts"
```

### Příklady konverzí

#### ❌ Před
```typescript
const response = await fetch('/api/restaurants');
```

#### ✅ Po
```typescript
import { getApiUrl } from '@/lib/config';

const response = await fetch(getApiUrl('/api/restaurants'));
```

---

## Konkrétní soubory

### 1. `app/page.tsx`

**Před:**
```typescript
const [restaurantsRes, filtersRes] = await Promise.all([
  fetch("/api/restaurants"),
  fetch("/api/restaurants/filters"),
]);
```

**Po:**
```typescript
import { getApiUrl } from '@/lib/config';

const [restaurantsRes, filtersRes] = await Promise.all([
  fetch(getApiUrl("/api/restaurants")),
  fetch(getApiUrl("/api/restaurants/filters")),
]);
```

---

### 2. `app/lokality/page.tsx`

**Před:**
```typescript
const [restaurantsRes, filtersRes] = await Promise.all([
  fetch("/api/restaurants"),
  fetch("/api/restaurants/filters"),
]);
```

**Po:**
```typescript
import { getApiUrl } from '@/lib/config';

const [restaurantsRes, filtersRes] = await Promise.all([
  fetch(getApiUrl("/api/restaurants")),
  fetch(getApiUrl("/api/restaurants/filters")),
]);
```

---

### 3. `app/kuchyne/page.tsx`

Stejná změna jako výše.

---

### 4. `components/RestaurantForm.tsx`

**Fetch photo:**
```typescript
const response = await fetch(getApiUrl(`/api/places/photo?${params}`));
```

**Submit form:**
```typescript
const response = await fetch(getApiUrl(url), {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(cleanData),
});
```

**Load restaurant:**
```typescript
.then((res) => fetch(getApiUrl(`/api/restaurants/${restaurantId}`)))
```

---

### 5. `components/TrendingForm.tsx`

**Fetch photo:**
```typescript
const response = await fetch(getApiUrl(`/api/places/photo?${params}`));
```

**Submit:**
```typescript
const response = await fetch(getApiUrl(url), {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(cleanData),
});
```

**Load trending:**
```typescript
fetch(getApiUrl(`/api/trendings/${trendingId}`))
```

---

### 6. `components/AdminDashboard.tsx`

**Delete:**
```typescript
await fetch(getApiUrl(`/api/restaurants/${id}`), {
  method: "DELETE",
});
```

**Fetch all photos:**
```typescript
const response = await fetch(getApiUrl("/api/admin/fetch-all-photos"), {
  method: "POST",
});
```

**Fetch all addresses:**
```typescript
const response = await fetch(getApiUrl("/api/admin/fetch-all-addresses"), {
  method: "POST",
});
```

---

### 7. `components/TrendingsAdmin.tsx`

**Delete:**
```typescript
await fetch(getApiUrl(`/api/trendings/${id}`), {
  method: "DELETE",
});
```

**Update order:**
```typescript
await fetch(getApiUrl(`/api/trendings/${trending.id}`), {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...trending, display_order: index }),
});
```

---

### 8. `components/ImportForm.tsx`

**Submit:**
```typescript
const response = await fetch(getApiUrl("/api/import"), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: parsedData }),
});
```

---

### 9. `components/LogoutButton.tsx`

**Logout:**
```typescript
await fetch(getApiUrl("/api/auth/logout"), {
  method: "POST",
});
```

---

### 10. `app/admin/login/page.tsx`

**Login:**
```typescript
const response = await fetch(getApiUrl("/api/auth/login"), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password }),
});
```

---

## Krok 3: Testování

### Web app (bez změn)
```bash
npm run dev
```

Otevřít http://localhost:3000 a otestovat:
- [ ] Homepage se načítá
- [ ] Filtry fungují
- [ ] Detaily restaurací
- [ ] Admin login
- [ ] CRUD operace

### Mobile app (po migraci)
```bash
npm run build:mobile
npm run cap:android  # nebo cap:ios
```

V emulátoru otestovat stejné věci.

---

## CORS konfigurace

Pokud mobile app nefunguje kvůli CORS errors, musíme povolit requesty z Capacitor app.

### Vercel (automaticky povoleno)
Next.js API routes by měly defaultně povolit všechny originy. Pokud ne, přidat do API route:

```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data });

  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
}
```

---

## Kontrolní checklist

- [ ] `lib/config.ts` vytvořen
- [ ] `app/page.tsx` aktualizován
- [ ] `app/lokality/page.tsx` aktualizován
- [ ] `app/kuchyne/page.tsx` aktualizován
- [ ] `components/RestaurantForm.tsx` aktualizován
- [ ] `components/TrendingForm.tsx` aktualizován
- [ ] `components/AdminDashboard.tsx` aktualizován
- [ ] `components/TrendingsAdmin.tsx` aktualizován
- [ ] `components/ImportForm.tsx` aktualizován
- [ ] `components/LogoutButton.tsx` aktualizován
- [ ] `app/admin/login/page.tsx` aktualizován
- [ ] Web app funguje (localhost:3000)
- [ ] Mobile build úspěšný (`npm run build:mobile`)
- [ ] Mobile app funguje v emulátoru

---

## Alternativní přístup: Centralizovaný API client

Místo importu `getApiUrl` všude, můžeme vytvořit API client:

**Soubor:** `lib/api-client.ts`

```typescript
import { getApiUrl } from './config';

class ApiClient {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(getApiUrl(endpoint));
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    return response.json();
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    return response.json();
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  }
}

export const api = new ApiClient();
```

**Použití:**
```typescript
import { api } from '@/lib/api-client';

// Místo:
const response = await fetch(getApiUrl('/api/restaurants'));
const data = await response.json();

// Použít:
const data = await api.get('/api/restaurants');
```

To je elegantnější, ale vyžaduje větší refactoring.

---

*Guide vytvořen: 9.11.2025*
