# Plán migrace na mobilní aplikaci (Android + iOS)

## Přehled projektu
**Projekt:** Gastro Tips (www.pojdsemkamjdes.cz)
**Tech stack:** Next.js 15, React 19, Supabase, Tailwind CSS
**Cíl:** Vytvoření nativních mobilních aplikací pro Android a iOS

---

## Zvolený přístup: Capacitor

### Proč Capacitor?
- Využije 95%+ stávajícího kódu
- Skutečné nativní appky v App Store a Play Store
- Přístup k nativním funkcím (push notifikace, GPS, kamera)
- Snadná údržba (jeden codebase)

---

## Aktuální stav projektu

### API Routes (11 endpointů)
```
/api/auth/login
/api/auth/logout
/api/restaurants
/api/restaurants/filters
/api/restaurants/[id]
/api/trendings
/api/trendings/[id]
/api/import
/api/places/photo
/api/admin/fetch-all-photos
/api/admin/fetch-all-addresses
```

### Závislosti
- Next.js 15.0.3
- React 19.0.0
- Supabase client
- React Hook Form + Zod
- DnD Kit (drag & drop)
- Tailwind CSS

### Produkční URL
- Web: www.pojdsemkamjdes.cz
- Admin: www.pojdsemkamjdes.cz/admin

---

## Výzvy a řešení

### 1. Static Export vs API Routes
**Problém:** Capacitor potřebuje static export, ale Next.js API routes nefungují ve static módu.

**Řešení:**
- Zachovat backend na Vercelu (API routes zůstávají)
- Mobile app se bude připojovat na `https://www.pojdsemkamjdes.cz/api/*`
- Případně: separátní API server (Vercel Serverless Functions)

### 2. Supabase autentizace
**Stav:** Aktuálně používá cookie-based auth pro admin.

**Řešení:**
- Zachovat stávající Supabase client
- Mobile app bude používat stejné API endpointy
- Token storage v nativním secure storage

### 3. Google Places API
**Stav:** Server-side API calls (API key je v .env.local)

**Řešení:**
- API key zůstane na serveru (bezpečnější)
- Mobile app volá `/api/places/photo` endpoint

---

## Implementační kroky

### Fáze 1: Příprava (večer - dnes)
- [ ] Vytvořit Capacitor config
- [ ] Nainstalovat Capacitor dependencies
- [ ] Připravit ikony a splash screens
- [ ] Otestovat build proces

### Fáze 2: Úpravy kódu (1-2 dny)
- [ ] Upravit Next.js config pro hybrid mode
- [ ] Přidat environment detection (web vs mobile)
- [ ] Upravit API calls na absolutní URLs pro mobile
- [ ] Testovat na iOS/Android emulátorech

### Fáze 3: Native features (volitelné)
- [ ] Push notifikace (nové restaurace)
- [ ] Geolokace (restaurace poblíž)
- [ ] Share funkcionalita
- [ ] Offline mode (cache)

### Fáze 4: Publikace
- [ ] Apple Developer Account ($99/rok)
- [ ] Google Play Developer Account ($25 jednorázově)
- [ ] Příprava store listingů
- [ ] Screenshot a popisy
- [ ] Submission a review process

---

## Potřebné účty a náklady

### Apple Developer
- **Cena:** $99/rok
- **Potřeba:** Ano (pro iOS appku)
- **Link:** https://developer.apple.com

### Google Play Developer
- **Cena:** $25 jednorázově
- **Potřeba:** Ano (pro Android appku)
- **Link:** https://play.google.com/console

---

## Technické požadavky

### Pro vývoj iOS:
- macOS počítač
- Xcode nainstalovaný
- iOS Simulator

### Pro vývoj Android:
- Android Studio
- Android SDK
- Android Emulator (nebo fyzické zařízení)

---

## Timeline odhad

| Fáze | Čas | Poznámka |
|------|-----|----------|
| Setup a konfigurace | 2-4 hodiny | Instalace, základní setup |
| Úpravy kódu | 1-2 dny | API calls, testování |
| Native features | 2-3 dny | Volitelné, podle požadavků |
| Testing | 1-2 dny | Emulátory, fyzická zařízení |
| Store submission | 1-2 týdny | Review proces Apple/Google |

**Celkem:** 1-2 týdny do první verze v stores

---

## Další kroky (večer)

1. Rozhodnout o prioritách (co chceme v první verzi)
2. Nainstalovat Capacitor
3. Vytvořit ikony a splash screens
4. První build a test na emulátoru

---

*Dokumentace vytvořena: 9.11.2025*
*Poslední update: 9.11.2025*
