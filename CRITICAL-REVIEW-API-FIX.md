# ⚠️ KRITICKÁ OPRAVA: Review API Endpoint

## 🔴 PROBLÉM
Review API endpoint `/api/reviews/[id]` vracel **500 Internal Server Error** na produkci (Vercel), ale fungoval lokálně.

### Symptomy:
- Kliknutí na review badge nebo kartu způsobovalo redirect na homepage
- Console error: `GET https://www.pojdsemkamjdes.cz/api/reviews/10 500 (Internal Server Error)`
- Lokálně vše fungovalo perfektně
- Jiné [id] API routes (restaurants, cafes) fungovaly správně

## ✅ ŘEŠENÍ

### Co bylo špatně:
Endpoint měl **`generateStaticParams()`** funkci, která patří do **PAGES**, ne do **API ROUTES**!

```typescript
// ❌ ŠPATNĚ - NIKDY NEDÁVAT DO API ROUTES!
export async function generateStaticParams() {
  return [];
}
```

### Co to opravilo:

1. **ODSTRANIT `generateStaticParams()`** - není pro API routes
2. **PŘIDAT runtime config:**
   ```typescript
   export const runtime = 'nodejs';
   export const dynamic = 'force-dynamic';
   ```

### Finální správný kód:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getReviewById, updateReview, deleteReview } from "@/lib/db";
import { reviewSchema } from "@/lib/types";

// ✅ SPRÁVNĚ - Explicitní runtime config pro Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/reviews/[id] - Get single review
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const review = await getReviewById(parseInt(id, 10));

    if (!review) {
      return NextResponse.json(
        { error: "Recenze nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst recenzi" },
      { status: 500 }
    );
  }
}

// ... PUT a DELETE metody stejným způsobem
```

## 📋 PRAVIDLA PRO API ROUTES

### ✅ CO DĚLAT:
1. **Vždy používat `RouteParams` interface** pro Next.js 14.2+ async params
2. **Destrukturovat params** v signatuře funkce: `{ params }: RouteParams`
3. **Await params**: `const { id } = await params;`
4. **Pro dynamické endpointy přidat:**
   ```typescript
   export const runtime = 'nodejs';
   export const dynamic = 'force-dynamic';
   ```

### ❌ CO NEDĚLAT:
1. **NIKDY nepřidávat `generateStaticParams()` do API routes** - to je jen pro pages!
2. Nesnažit se API routes staticky generovat
3. Nepoužívat `context.params` místo destrukturování

## 🔍 PROČ TO SELHÁVALO

### Problém s `generateStaticParams()`:
- Next.js viděl `generateStaticParams()` a snažil se endpoint **staticky předgenerovat**
- Na Vercelu to způsobilo konflikt mezi **static export** (pro mobile) a **dynamic API routes**
- Lokálně dev server to ignoroval, na produkci to crashovalo

### Proč to fungovalo pro ostatní [id] routes:
- Žádný jiný API endpoint neměl `generateStaticParams()`
- Všechny používaly správný pattern z restaurants/cafes

## 📊 TIMELINE OPRAVY

1. **Commit 8748606** - První pokus s `instanceof Promise` check - nefungovalo
2. **Commit 3a44a12** - Pokus s always await - stále nefungovalo
3. **Commit 76f9b0c** - Debug logging - nepomohlo identifikovat problém
4. **Commit 60d7353** - Oprava params handling - stále nefungovalo
5. **Commit df20c1a** - Kompletní přepsání podle restaurants pattern - stále nefungovalo
6. **Commit 87484dd** - ✅ **KONEČNÉ ŘEŠENÍ** - odstranění `generateStaticParams()` + runtime config

## 🎯 KONTROLNÍ SEZNAM PRO NOVÝ API ENDPOINT

Při vytváření nového `[id]` API route:

```typescript
import { NextRequest, NextResponse } from "next/server";

// ✅ 1. Runtime config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ✅ 2. RouteParams interface
interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// ✅ 3. Destrukturování params v signatuře
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // ✅ 4. Await params
    const { id } = await params;
    const numericId = parseInt(id, 10);

    // ... zbytek logiky
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error message" },
      { status: 500 }
    );
  }
}
```

## 🚨 NIKDY:
- ❌ `generateStaticParams()` v API routes
- ❌ `context.params` místo destrukturování
- ❌ Zapomenout await params

---

**Opraveno:** 2026-02-07
**Commits:** 8748606 → 87484dd (celkem 7 pokusů)
**Čas strávený debugováním:** ~1 den
**Root cause:** `generateStaticParams()` v API route způsobující konflikt se static exportem
