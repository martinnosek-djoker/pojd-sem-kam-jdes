# Gastro Tips - Dokumentace

Tato složka obsahuje kompletní dokumentaci projektu a návody pro přechod na mobilní aplikaci.

---

## 📚 Dokumenty

### Projektová dokumentace
- **[project-overview.md](./project-overview.md)** - Kompletní přehled projektu
  - Struktura stránkek a komponent
  - API endpointy
  - Databázové modely
  - Klíčové funkcionality
  - Data flow

### Mobile App dokumentace
- **[mobile-app-plan.md](./mobile-app-plan.md)** - Plán migrace na mobilní appku
  - Důvody pro Capacitor
  - Výzvy a řešení
  - Timeline odhad

- **[capacitor-setup-guide.md](./capacitor-setup-guide.md)** - Krok za krokem setup guide
  - Instalace Capacitor
  - Konfigurace projektu
  - Build proces
  - Testování
  - Publikace do stores
  - Troubleshooting

- **[api-migration-guide.md](./api-migration-guide.md)** - Migrace API calls
  - Přechod z relativních na absolutní URLs
  - Konkrétní soubory k aktualizaci
  - CORS konfigurace
  - Testovací checklist

---

## 🗂️ Konfigurace (configs/)

Předpřipravené konfigurační soubory ready k použití:

- **capacitor.config.ts** - Hlavní Capacitor config
- **next.config.updated.mjs** - Aktualizovaný Next.js config pro static export
- **lib-config.ts** - API URL helper pro hybrid app
- **package.json.additions** - Nové npm scripty a dependencies
- **.gitignore.additions** - Co přidat do .gitignore

---

## 🚀 Quick Start

### Pro večerní session

1. **Přečíst si:**
   - `mobile-app-plan.md` - 5 minut
   - `capacitor-setup-guide.md` - 10 minut

2. **Připravit:**
   - Android Studio nainstalované (pokud chceme Android)
   - Xcode nainstalované (pokud chceme iOS - pouze macOS)

3. **Začít:**
   - Postupovat podle `capacitor-setup-guide.md` Fáze 1

---

## 📋 Checklist migrace

### Přípravná fáze
- [x] Dokumentace projektu vytvořena
- [x] Capacitor setup guide připraven
- [x] Konfigurační soubory připraveny
- [ ] Ikony a splash screens připraveny
- [ ] Android Studio nainstalováno
- [ ] Xcode nainstalováno (macOS)

### Instalace (15 min)
- [ ] Capacitor dependencies nainstalovány
- [ ] Capacitor inicializován
- [ ] Next.js config aktualizován
- [ ] Package.json scripty přidány

### Migrace kódu (30 min)
- [ ] `lib/config.ts` vytvořen
- [ ] API calls aktualizovány (podle api-migration-guide.md)
- [ ] Web app otestována (localhost)

### Build a test (1 hodina)
- [ ] První build úspěšný (`npm run build:mobile`)
- [ ] Android platforma přidána
- [ ] iOS platforma přidána (macOS)
- [ ] Testování v emulátoru

### Polishing (2 hodiny)
- [ ] Ikony vygenerovány
- [ ] Splash screens vytvořeny
- [ ] Status bar konfigurován
- [ ] Orientace nastavena
- [ ] Final testing

### Publikace (podle potřeby)
- [ ] Google Play Developer účet
- [ ] Apple Developer účet
- [ ] Screenshots připraveny
- [ ] Popisy napsány
- [ ] Privacy Policy URL
- [ ] Submission

---

## 🛠️ Užitečné příkazy

```bash
# Vývoj
npm run dev                 # Web dev server

# Build
npm run build              # Standardní build
npm run build:mobile       # Build + sync pro mobile

# Capacitor
npm run cap:sync           # Sync změn do native projektů
npm run cap:android        # Otevřít Android Studio
npm run cap:ios            # Otevřít Xcode
npm run cap:run:android    # Run na Android emulátoru
npm run cap:run:ios        # Run na iOS simulátoru
```

---

## 🔍 Vyhledávání v dokumentaci

### Hledám informaci o...

**Struktuře projektu:**
→ `project-overview.md` → "Struktura projektu"

**API endpointech:**
→ `project-overview.md` → "API Routes"

**Databázových modelech:**
→ `project-overview.md` → "Databázové modely"

**Capacitor setupu:**
→ `capacitor-setup-guide.md` → "Fáze 1-7"

**API migraci:**
→ `api-migration-guide.md` → "Krok 2"

**Config souborech:**
→ `configs/` složka

**Troubleshootingu:**
→ `capacitor-setup-guide.md` → "Troubleshooting"

**Publikaci do stores:**
→ `capacitor-setup-guide.md` → "Fáze 7"

---

## 📞 Support

Pokud narazíte na problém:

1. Zkontrolovat Troubleshooting sekci v guides
2.ググル error message
3. Check Capacitor docs: https://capacitorjs.com/docs
4. Check Next.js docs: https://nextjs.org/docs

---

## 📝 TODO (budoucnost)

- [ ] Push notifikace implementace
- [ ] Geolokace pro "restaurace poblíž"
- [ ] Offline mode s cache
- [ ] Share funkcionalita
- [ ] Deep linking
- [ ] App ratings prompt
- [ ] Analytics (Firebase, Mixpanel)

---

*Dokumentace vytvořena: 9.11.2025*
*Aktualizováno: 9.11.2025*

**Autor:** Claude (AI Assistant)
**Pro projekt:** Gastro Tips - Pojď sem! Kam jdeš?
