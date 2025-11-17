# 📱 Mobile App Setup - Kompletní návod

Tento dokument popisuje celý proces vytvoření mobilní aplikace pomocí Capacitor.

## ✅ Co už je hotové

### 1. Capacitor Instalace
- ✅ Nainstalovány balíčky: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`
- ✅ Vytvořen `capacitor.config.ts`
- ✅ Přidány npm scripty: `build:mobile`, `cap:android`, `cap:ios`, `cap:sync`

### 2. Next.js Konfigurace
- ✅ Upravený `next.config.mjs` s podmíněným static exportem
- ✅ Environment variable `MOBILE_BUILD=true` pro mobile buildy

### 3. API Konfigurace
- ✅ Vytvořen `/lib/api-config.ts` helper
- ✅ Funkce `getApiUrl()` pro detekci mobile/web prostředí
- ✅ **Všech 38 fetch() callů aktualizováno** ve 12 souborech

### 4. Assets Příprava
- ✅ Vytvořeny SVG soubory v `resources/`:
  - `app-icon.svg` - Source pro app ikonu
  - `splash.svg` - Source pro splash screen
  - `README.md` - Návod na konverzi na PNG

## 🔨 Co musíš udělat

### Krok 1: Vytvoř PNG soubory (5 minut)

**Možnost A: Online konvertor (doporučeno)**
1. Jdi na https://cloudconvert.com/svg-to-png
2. Nahraj `resources/app-icon.svg`
3. Nastav velikost: **1024 x 1024 px**
4. Stáhni jako `icon.png` do `resources/`
5. Opakuj pro `splash.svg` s velikostí **2732 x 2732 px** → `splash.png`

**Možnost B: ImageMagick (příkazová řádka)**
```bash
brew install imagemagick
cd resources
convert app-icon.svg -resize 1024x1024 icon.png
convert splash.svg -resize 2732x2732 splash.png
```

### Krok 2: První Mobile Build (10 minut)

```bash
# 1. Build pro mobile
npm run build:mobile

# 2. Přidej platformy
npx cap add android
npx cap add ios  # pouze na macOS

# 3. Vygeneruj app ikony a splash screens
npm install -g @capacitor/assets
npx capacitor-assets generate --iconPath resources/icon.png --splashPath resources/splash.png
```

### Krok 3: Test na Emulátoru

#### Android (Windows/macOS/Linux)
```bash
# 1. Otevři Android Studio
npm run cap:android

# 2. V Android Studio:
# - Počkej na Gradle sync
# - Vyber emulator nebo fyzické zařízení
# - Klikni na zelené tlačítko Run
```

#### iOS (pouze macOS)
```bash
# 1. Otevři Xcode
npm run cap:ios

# 2. V Xcode:
# - Signing & Capabilities → vyber Team
# - Vyber simulator
# - Klikni na Play tlačítko
```

## 📋 Checklist před prvním buildem

- [ ] PNG soubory vytvořeny (`icon.png` + `splash.png`)
- [ ] Spuštěn `npm run build:mobile` (bez chyb)
- [ ] Platformy přidány (`npx cap add android/ios`)
- [ ] Assets vygenerovány (`npx capacitor-assets generate`)
- [ ] Android Studio nainstalováno (pro Android)
- [ ] Xcode nainstalováno (pro iOS, pouze macOS)

## 🚀 Workflow pro update appky

Když uděláš změny v kódu:

```bash
# 1. Build novou verzi
npm run build:mobile

# 2. Sync s native projekty
npm run cap:sync

# 3. Otevři IDE a spusť
npm run cap:android  # nebo cap:ios
```

## 🔍 Troubleshooting

### Build error: "output: export nejde s API routes"
✅ **Vyřešeno** - používáme `MOBILE_BUILD=true` pro podmíněný export

### API calls nefungují v mobile app
✅ **Vyřešeno** - všechny fetch() používají `getApiUrl()` helper

### Fotky se nenačítají
✅ **Vyřešeno** - `images.unoptimized: true` v next.config.mjs

### Android build error
```bash
cd android
./gradlew clean
cd ..
npm run build:mobile
npm run cap:sync
```

### iOS signing issues
- Potřebuješ platný Apple Developer účet ($99/rok)
- Bundle ID: `cz.pojdsemkamjdes.app`
- V Xcode: Signing & Capabilities → Team

## 📦 Další Features (volitelné)

### GPS Geolokace
```bash
npm install @capacitor/geolocation
```

### Push Notifikace
```bash
npm install @capacitor/push-notifications
```

### Share Funkcionalita
```bash
npm install @capacitor/share
```

## 📝 Poznámky

- Web build zůstává na Vercelu (`npm run build`)
- Mobile build vytváří static export (`npm run build:mobile`)
- API routes zůstávají na `https://www.pojdsemkamjdes.cz/api/*`
- Mobile app se připojuje na produkční API

## 🎯 Další kroky

Po úspěšném prvním buildu:

1. **Testování funkcí**
   - Seznam restaurací
   - Filtry
   - Detail restaurace
   - Google Maps linky
   - Admin funkce

2. **Native Features**
   - Implementovat GPS geolokaci
   - Implementovat push notifikace
   - Offline mode

3. **Publishing**
   - Google Play Console účet ($25 jednorázově)
   - Apple Developer účet ($99/rok)
   - Screenshots a store listing
   - Submit pro review

## 🔗 Užitečné odkazy

- [Capacitor Dokumentace](https://capacitorjs.com/docs)
- [Capacitor Setup Guide](./capacitor-setup-guide.md)
- [Mobile App Plan](./mobile-app-plan.md)
- [Assets README](../resources/README.md)
