# Mobile App Migration - Přehled a Status

## 📋 Co je připraveno

### ✅ Kompletní dokumentace
1. **Project Overview** (`project-overview.md`)
   - Popis všech 8 stránek
   - 12 komponent s funkcemi
   - 11 API endpointů
   - Databázové modely
   - Klíčové funkcionality

2. **Mobile App Plan** (`mobile-app-plan.md`)
   - Proč Capacitor
   - Výzvy a řešení
   - Timeline: 1-2 týdny

3. **Capacitor Setup Guide** (`capacitor-setup-guide.md`)
   - 7 fází implementace
   - Krok za krokem instrukce
   - Troubleshooting
   - Timeline: ~7-8 hodin

4. **API Migration Guide** (`api-migration-guide.md`)
   - Detailní migrace všech API calls
   - Konkrétní soubory (11 souborů k aktualizaci)
   - CORS konfigurace
   - Testing checklist

5. **Testing Checklist** (`testing-checklist.md`)
   - Web app testing
   - Android testing
   - iOS testing
   - Performance benchmarks
   - Pre-release checklist

### ✅ Připravené konfigurace (`configs/`)
1. `capacitor.config.ts` - Hlavní Capacitor config
2. `next.config.updated.mjs` - Next.js pro static export
3. `lib-config.ts` - API URL helpers
4. `package.json.additions` - Npm scripty a dependencies
5. `.gitignore.additions` - Co přidat do gitignore

---

## 🎯 Co bude dneska večer

### Fáze 1: Setup (15 minut)
```bash
# 1. Instalace dependencies
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npm install @capacitor/splash-screen @capacitor/status-bar

# 2. Init Capacitor
npx cap init

# 3. Zkopírovat configs
cp docs/configs/capacitor.config.ts ./
cp docs/configs/next.config.updated.mjs ./next.config.mjs
cp docs/configs/lib-config.ts ./lib/config.ts

# 4. Update package.json
# Přidat scripty z docs/configs/package.json.additions
```

### Fáze 2: Migrace API calls (30 minut)
Postupovat podle `api-migration-guide.md`:
- [ ] 11 souborů k aktualizaci
- [ ] Import `getApiUrl` helper
- [ ] Replace všechny `fetch('/api/` s `fetch(getApiUrl('/api/`

### Fáze 3: První build (20 minut)
```bash
# Build
npm run build:mobile

# Přidat platformy
npx cap add android
# npx cap add ios  # pokud máte macOS
```

### Fáze 4: Test (30 minut)
- Otevřít Android Studio
- Run v emulátoru
- Projít testing checklist

---

## 📈 Progress Tracker

### Setup & Config
- [x] Dokumentace vytvořena
- [x] Config soubory připraveny
- [ ] Dependencies nainstalovány
- [ ] Capacitor inicializován
- [ ] Configs zkopírovány

### Code Migration
- [ ] `lib/config.ts` vytvořen
- [ ] `app/page.tsx` ✏️
- [ ] `app/lokality/page.tsx` ✏️
- [ ] `app/kuchyne/page.tsx` ✏️
- [ ] `components/RestaurantForm.tsx` ✏️
- [ ] `components/TrendingForm.tsx` ✏️
- [ ] `components/AdminDashboard.tsx` ✏️
- [ ] `components/TrendingsAdmin.tsx` ✏️
- [ ] `components/ImportForm.tsx` ✏️
- [ ] `components/LogoutButton.tsx` ✏️
- [ ] `app/admin/login/page.tsx` ✏️

### Build & Test
- [ ] Web app funguje (post-migration)
- [ ] First mobile build úspěšný
- [ ] Android emulator test
- [ ] iOS simulator test (macOS)

### Polish
- [ ] Ikony připraveny
- [ ] Splash screens vytvořeny
- [ ] Status bar konfigurován
- [ ] Final testing

---

## ⏱️ Časový odhad (večer)

| Aktivita | Čas | Kumulativní |
|----------|-----|-------------|
| Setup & instalace | 15 min | 0:15 |
| Migrace API calls | 30 min | 0:45 |
| První build | 20 min | 1:05 |
| Testing v emulátoru | 30 min | 1:35 |
| Debugging issues | 30 min | 2:05 |
| **Celkem večer** | **~2 hodiny** | |

**Poznámka:** První večer cíl = funkční app v emulátoru. Polish a publikace můžeme dodělat postupně.

---

## 🎨 Assets TODO

### Co budeme potřebovat (ne dneska)

**App Icon:**
- 1024x1024 PNG (iOS)
- 512x512 PNG (Android)
- Beze zakulacení
- Transparent nebo barevné pozadí

**Splash Screen:**
- 2732x2732 PNG
- Logo vycentrované
- Pozadí: černé (match s app designem)

**Screenshots pro store:**
- Android: 4-8 screenshots různých obrazovek
- iOS: 6.5", 5.5" screenshots

**Store listing:**
- Krátký popis (80 znaků)
- Dlouhý popis (4000 znaků)
- Privacy Policy URL
- Support email

---

## 🚨 Možné problémy a řešení

### Problem 1: Build fails
**Příčina:** Next.js Image component nefunguje v static export

**Řešení:** V next.config: `images.unoptimized: true`

### Problem 2: API calls fail
**Příčina:** CORS errors z mobile app

**Řešení:**
1. Vercel by mělo CORS povolit automaticky
2. Pokud ne, přidat CORS headers do API routes

### Problem 3: Fotky se nenačítají
**Příčina:** Google Places API URL expirují nebo CORS

**Řešení:**
1. Cache fotky na server (CDN)
2. Nebo proxy přes API route

### Problem 4: Admin nefunguje v mobile
**Poznámka:** Admin pravděpodobně nebude v mobile app potřeba. Můžeme:
1. Skrýt admin stránky v mobile build
2. Nebo použít web admin na počítači

---

## 📱 Platform Priority

### Doporučení: Začít s Android
**Důvody:**
- Jednodušší setup (Android Studio na všech platformách)
- Levnější ($25 vs $99/rok)
- Rychlejší review proces (hodiny vs dny)
- Méně přísný

### iOS až později
- Vyžaduje macOS + Xcode
- Apple Developer účet ($99/rok)
- Přísnější review

---

## 📞 Contacts & Resources

### Užitečné linky
- **Capacitor Docs:** https://capacitorjs.com/docs
- **Next.js Static Export:** https://nextjs.org/docs/pages/building-your-application/deploying/static-exports
- **Google Play Console:** https://play.google.com/console
- **App Store Connect:** https://appstoreconnect.apple.com

### Debugging
- Chrome DevTools (Android): `chrome://inspect`
- Safari Web Inspector (iOS): Safari → Develop
- Logcat (Android): `adb logcat`

---

## ✨ Quick Commands Reference

```bash
# Development
npm run dev                    # Web dev server

# Build
npm run build                  # Standard build
npm run build:mobile          # Build + sync pro mobile

# Capacitor
npm run cap:sync              # Sync změn
npm run cap:android           # Open Android Studio
npm run cap:ios               # Open Xcode
npm run cap:run:android       # Run v Android emulátoru
npm run cap:run:ios           # Run v iOS simulátoru

# Debugging
adb logcat | grep Capacitor   # Android logs
npx cap doctor                # Diagnostika
```

---

## 🎉 Milestone Goals

### Tonight (Session 1)
- [x] Dokumentace kompletní
- [ ] Capacitor nainstalován
- [ ] API calls migrované
- [ ] První successful build
- [ ] App běží v Android emulátoru

### Session 2 (příště)
- [ ] Ikony a splash screens
- [ ] iOS setup (pokud macOS)
- [ ] Polish a tuning
- [ ] Beta testing

### Session 3 (finále)
- [ ] Store listing připraven
- [ ] Screenshots
- [ ] Submission do Google Play
- [ ] (Volitelně) Submission do App Store

---

## 💡 Tipy pro úspěch

1. **Backup před začátkem**
   ```bash
   git checkout -b mobile-app-migration
   git add .
   git commit -m "Backup before mobile migration"
   ```

2. **Testovat průběžně**
   - Po každé změně: `npm run dev` (web test)
   - Po build: test v emulátoru

3. **Jedna věc po druhé**
   - Nejdřív setup
   - Pak migrace
   - Pak build
   - Pak polish

4. **Dokumentovat problémy**
   - Zapisovat co nefunguje
   - Zapisovat řešení
   - Update docs pro příště

---

**Status:** ✅ Připraveno pro večerní session
**Poslední update:** 9.11.2025
**Next step:** Instalace Capacitor (Fáze 1)
