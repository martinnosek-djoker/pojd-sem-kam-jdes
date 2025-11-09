# Capacitor Setup Guide - Krok za krokem

## Co budeme potřebovat

### Software
- [x] Node.js (už máte)
- [ ] Android Studio (pro Android build)
- [ ] Xcode (pro iOS build - pouze macOS)

### Účty
- [ ] Apple Developer Account ($99/rok) - pro iOS
- [ ] Google Play Developer Account ($25 jednorázově) - pro Android

---

## Fáze 1: Instalace Capacitor (10-15 minut)

### Krok 1: Instalace Capacitor CLI a core
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

### Krok 2: Inicializace Capacitor
```bash
npx cap init
```

Budete dotázáni:
- **App name:** `Pojď sem! Kam jdeš?`
- **App package ID:** `cz.pojdsemkamjdes.app`
- **Web asset directory:** `out` (pro Next.js static export)

### Krok 3: Úprava Next.js config
Soubor: `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static export pro Capacitor
  images: {
    unoptimized: true,  // Image optimization nefunguje ve static exportu
  },
  // Trailing slash pro správné routing v mobile app
  trailingSlash: true,
};

export default nextConfig;
```

### Krok 4: Úprava package.json scripts
Přidat nové scripty:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "build:mobile": "next build && npx cap sync",
    "start": "next start",
    "lint": "next lint",
    "cap:android": "npx cap open android",
    "cap:ios": "npx cap open ios",
    "cap:sync": "npx cap sync"
  }
}
```

---

## Fáze 2: Konfigurace API endpoints (5 minut)

### Problem: Static export nemůže mít API routes

**Řešení:** API routes zůstanou na Vercelu, mobile app se připojí přes HTTPS

### Krok 1: Vytvořit environment detection
Soubor: `lib/config.ts`

```typescript
// Detekce prostředí
export const IS_MOBILE = typeof window !== 'undefined' &&
  (window as any).Capacitor !== undefined;

// API base URL
export const API_BASE_URL = IS_MOBILE
  ? 'https://www.pojdsemkamjdes.cz'
  : '';

// Helper pro API calls
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}
```

### Krok 2: Aktualizovat fetch calls
Místo:
```typescript
fetch('/api/restaurants')
```

Použít:
```typescript
import { getApiUrl } from '@/lib/config';
fetch(getApiUrl('/api/restaurants'))
```

---

## Fáze 3: Build a sync (5 minut)

### Krok 1: První build
```bash
npm run build:mobile
```

Tím se:
1. Vytvoří static export do `out/` složky
2. Zkopírují soubory do native projektů
3. Připraví Android a iOS projekty

### Krok 2: Přidání platforem
```bash
npx cap add android
npx cap add ios  # pouze na macOS
```

---

## Fáze 4: Ikony a Splash Screens

### Potřebné obrázky

**App Icon:**
- `1024x1024` PNG (iOS)
- `512x512` PNG (Android)
- Bez zakulacení (Android to udělá sám)

**Splash Screen:**
- `2732x2732` PNG
- Logo vycentrované na jednolitém pozadí

### Umístění v projektu
```
resources/
├── icon.png           (1024x1024)
├── splash.png         (2732x2732)
└── android/
    └── ... (vygenerované)
```

### Generování
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate
```

---

## Fáze 5: Android Build

### Krok 1: Otevřít Android Studio
```bash
npm run cap:android
```

### Krok 2: V Android Studio
1. Počkat na Gradle sync
2. Menu: Build → Generate Signed Bundle / APK
3. Vybrat "APK" nebo "Android App Bundle"
4. Vytvořit keystore (nebo použít existující)
5. Build

### Krok 3: Testování
- Emulator: Přímo v Android Studio
- Fyzické zařízení: USB debugging

---

## Fáze 6: iOS Build (pouze macOS)

### Krok 1: Otevřít Xcode
```bash
npm run cap:ios
```

### Krok 2: V Xcode
1. Vybrat Signing & Capabilities
2. Team: Váš Apple Developer Account
3. Bundle Identifier: `cz.pojdsemkamjdes.app`
4. Product → Archive
5. Distribute App → App Store Connect

### Krok 3: Testování
- Simulator: Přímo v Xcode
- Fyzické zařízení: Připojit přes USB

---

## Fáze 7: Publikace

### Google Play Store

1. **Příprava:**
   - App Bundle (.aab soubor)
   - Screenshots (minimálně 2)
   - Icon 512x512
   - Feature Graphic 1024x500
   - Popis aplikace (krátký + dlouhý)
   - Privacy Policy URL

2. **Upload:**
   - Google Play Console
   - Create New App
   - Upload .aab
   - Vyplnit metadata
   - Submit for review

3. **Review:**
   - Obvykle 1-3 dny
   - Možné dotazy od Google

### Apple App Store

1. **Příprava:**
   - Archive z Xcode
   - Screenshots (různé velikosti iPhonů)
   - App Preview video (volitelné)
   - Icon 1024x1024
   - Popis aplikace
   - Privacy Policy URL
   - Keywords

2. **Upload:**
   - App Store Connect
   - My Apps → New App
   - Upload archive přes Xcode
   - Vyplnit metadata
   - Submit for review

3. **Review:**
   - Obvykle 1-2 dny
   - Přísnější než Google
   - Možné odmítnutí (pak opravit a resubmit)

---

## Capacitor Plugins (volitelné features)

### Push notifikace
```bash
npm install @capacitor/push-notifications
```

### Geolokace
```bash
npm install @capacitor/geolocation
```

### Share
```bash
npm install @capacitor/share
```

### Status Bar & Splash Screen
```bash
npm install @capacitor/status-bar
npm install @capacitor/splash-screen
```

---

## Troubleshooting

### Build fails s "output: export"
- Ujistěte se, že všechny komponenty jsou client-side nebo mají data přes API

### API calls nefungují
- Zkontrolujte CORS nastavení na Vercelu
- Ověřte, že používáte `getApiUrl()` helper

### Fotky se nenačítají
- `images.unoptimized: true` v next.config.mjs
- Nebo použít `<img>` místo Next.js `<Image>`

### Android build error
- Zkontrolovat Java/Gradle verze
- Vyčistit build: `cd android && ./gradlew clean`

### iOS signing issues
- Platný Apple Developer účet
- Správný Bundle ID
- Provisioning profiles aktuální

---

## Update workflow

Když uděláte změny v kódu:

```bash
# 1. Build nové verze
npm run build:mobile

# 2. Sync s native projekty
npm run cap:sync

# 3. Otevřít v IDE a build
npm run cap:android  # nebo cap:ios
```

---

## Kontrolní checklist před publikací

### Funkční testování
- [ ] Všechny stránky se načítají
- [ ] Filtry fungují
- [ ] API calls fungují
- [ ] Fotky se zobrazují
- [ ] Google Maps linky fungují
- [ ] Web linky fungují
- [ ] Hamburger menu funguje
- [ ] Navigace mezi stránkami

### Technické
- [ ] App icon vypadá dobře
- [ ] Splash screen vypadá dobře
- [ ] Status bar je správná barva
- [ ] Orientace uzamčená (portrait)
- [ ] Zpět tlačítko funguje správně
- [ ] Žádné console errors

### Metadata
- [ ] App name
- [ ] Popis
- [ ] Screenshots
- [ ] Privacy Policy
- [ ] Support email
- [ ] Keywords (iOS)
- [ ] Kategorie

### Legal
- [ ] Privacy Policy URL
- [ ] Terms of Service (volitelné)
- [ ] GDPR compliance (pokud sbíráte data)

---

## Časový odhad

| Úkol | Čas |
|------|-----|
| Instalace Capacitor | 15 min |
| Konfigurace projektu | 30 min |
| První build a test | 20 min |
| Ikony a splash screens | 30 min |
| Android setup | 1 hodina |
| iOS setup | 1 hodina |
| Testování | 2 hodiny |
| Store listing příprava | 2 hodiny |
| **Celkem** | **~7-8 hodin** |

---

*Guide vytvořen: 9.11.2025*
