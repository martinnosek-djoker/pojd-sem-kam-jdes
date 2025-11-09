# Testing Checklist - Mobile App

Kompletní checklist pro testování mobilní aplikace před publikací.

---

## 🌐 Web App Testing (baseline)

Před migrací na mobile ověřit, že web funguje:

### Homepage (/)
- [ ] Stránka se načte
- [ ] Trending podniky se zobrazují (4 karty)
- [ ] Quick filtry fungují (kliknutí přesměruje)
- [ ] Seznam restaurací se zobrazuje
- [ ] Filtry fungují (lokalita + typ kuchyně)
- [ ] Reset filtrů funguje
- [ ] Hamburger menu se otevírá/zavírá
- [ ] Navigace v menu funguje
- [ ] Instagram link funguje

### Restaurace v okolí (/lokality)
- [ ] Stránka se načte
- [ ] Lokality seřazeny abecedně
- [ ] Carousely fungují (horizontální scroll)
- [ ] Minimálně 3 restaurace na lokalitu
- [ ] Restaurant cards správně zobrazují
- [ ] Adresy se zobrazují s Google Maps linky
- [ ] Web linky fungují

### Světové kuchyně (/kuchyne)
- [ ] Stránka se načte
- [ ] Typy seřazeny abecedně
- [ ] Emoji ikony správné
- [ ] Carousely fungují
- [ ] Minimálně 3 restaurace na typ

### Placeholder stránky
- [ ] /kavarny zobrazuje "Brzy"
- [ ] /akce zobrazuje "Brzy"

### Admin (/admin)
- [ ] Login funguje (správné heslo)
- [ ] Login odmítá (špatné heslo)
- [ ] Dashboard se načte po loginu
- [ ] Hamburger menu NENÍ vidět v adminu
- [ ] Trendings: přidat, edit, delete
- [ ] Trendings: drag & drop řazení
- [ ] Restaurace: přidat, edit, delete
- [ ] Auto-fetch fotek funguje
- [ ] Výběr z galerie fotek funguje
- [ ] CSV import funguje
- [ ] Logout funguje

---

## 📱 Mobile App Testing (Android)

### První spuštění
- [ ] Splash screen se zobrazí
- [ ] App se načte do homepage
- [ ] Žádné console errors v Android Studio logcat
- [ ] Status bar správná barva

### Homepage
- [ ] Trending cards se načítají
- [ ] Fotky se zobrazují (ne broken images)
- [ ] Quick filtry fungují
- [ ] Seznam restaurací se načítá
- [ ] Filtry fungují
- [ ] Scroll je smooth
- [ ] Pull-to-refresh (pokud implementováno)

### Navigace
- [ ] Hamburger menu otevírání/zavírání
- [ ] Menu overlay funguje (kliknutí mimo zavře)
- [ ] Všechny menu linky fungují
- [ ] Zpět tlačítko (Android) funguje správně
- [ ] Navigace mezi stránkami je smooth

### Lokality stránka
- [ ] Načte se správně
- [ ] Carousely fungují (swipe)
- [ ] Fotky se načítají
- [ ] Google Maps linky fungují (otevře Google Maps)
- [ ] Web linky fungují (otevře browser)

### Kuchyně stránka
- [ ] Načte se správně
- [ ] Emoji ikony viditelné
- [ ] Carousely fungují
- [ ] Filtry fungují

### API Calls
- [ ] Všechny API requesty úspěšné (check Network tab)
- [ ] Žádné CORS errors
- [ ] Loading states zobrazují se
- [ ] Error states zobrazují se při offline

### Orientace
- [ ] Portrait mode funguje
- [ ] Landscape disabled (nebo funguje správně)

### Performance
- [ ] App se načítá rychle (< 3s)
- [ ] Scroll je smooth (60fps)
- [ ] Žádné lags při navigaci
- [ ] Paměť nepřeteče při dlouhém používání

### Offline behavior
- [ ] App zobrazí error při offline
- [ ] Nebo: cached data se zobrazí (pokud implementováno)

---

## 📱 Mobile App Testing (iOS)

Stejný checklist jako Android, plus:

### iOS specifické
- [ ] Safe area správně respektována (notch)
- [ ] Home indicator správně
- [ ] Swipe zpět gesture funguje
- [ ] Status bar správná barva
- [ ] App přežije v background
- [ ] App přežije memory warning

---

## 🔄 Regression Testing (po změnách)

Kdykoliv uděláte změnu v kódu:

### Rychlý test
- [ ] `npm run build:mobile` proběhne bez errors
- [ ] Web app stále funguje (localhost:3000)
- [ ] Mobile app se načte v emulátoru
- [ ] Základní navigace funguje

### Plný test
- [ ] Projít celý checklist znovu

---

## 🐛 Bug Reporting Template

Když najdete bug:

```markdown
## Bug Description
[Co se stalo]

## Expected Behavior
[Co mělo se stát]

## Steps to Reproduce
1.
2.
3.

## Platform
- [ ] Web
- [ ] Android
- [ ] iOS

## Device/Browser
[např. Pixel 7, Android 13]

## Screenshots
[pokud relevantní]

## Console Errors
[zkopírovat error messages]
```

---

## ✅ Pre-Release Checklist

Před odesláním do store:

### Funkční
- [ ] Všechny testy prošly
- [ ] Testováno na min. 3 různých zařízeních
- [ ] Testováno offline behavior
- [ ] Žádné kritické bugy

### Vizuální
- [ ] App icon vypadá dobře
- [ ] Splash screen vypadá dobře
- [ ] Všechny fotky se načítají
- [ ] Žádné layout issues
- [ ] Fonts správně

### Performance
- [ ] Načítání < 3s
- [ ] Scroll smooth
- [ ] Žádné memory leaks
- [ ] Battery drain přijatelný

### Legal/Compliance
- [ ] Privacy Policy URL nastavena
- [ ] Permissions správně žádány
- [ ] GDPR compliance (pokud sbíráte data)
- [ ] Age rating správný

### Metadata
- [ ] App name správný
- [ ] Popis napsaný (krátký + dlouhý)
- [ ] Screenshots v různých velikostech
- [ ] Keywords optimalizované (iOS)
- [ ] Kategorie vybraná
- [ ] Support email nastavený

### Technical
- [ ] Version number zvýšen
- [ ] Build number unikátní
- [ ] Signing certifikáty platné
- [ ] Všechny dependencies aktuální (žádné security issues)

---

## 📊 Performance Benchmarks

### Ideální hodnoty:

**Load times:**
- Cold start: < 3s
- Warm start: < 1s
- Page transitions: < 300ms

**Memory:**
- Idle: < 50MB
- Active use: < 150MB
- Peak: < 200MB

**Network:**
- API response: < 500ms
- Image load: < 1s
- Total page load: < 2s

**Battery:**
- 1 hodina použití: < 5% battery drain

---

## 🔧 Debugging Tools

### Android
```bash
# Logcat
adb logcat | grep -i capacitor

# Chrome DevTools
chrome://inspect/#devices
```

### iOS
```bash
# Safari Web Inspector
Safari → Develop → [Your Device] → [Your App]
```

### Network debugging
```bash
# Charles Proxy nebo Proxyman
# Pro monitoring všech API calls
```

---

*Checklist vytvořen: 9.11.2025*
