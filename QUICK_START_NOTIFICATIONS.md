# 🚀 Rychlý Start - Push Notifikace

Tento návod ti řekne přesně, co musíš udělat, aby fungovaly push notifikace.

## ✅ Checklist - Co potřebuješ

- [ ] Firebase projekt
- [ ] `google-services.json` soubor
- [ ] Service Account JSON
- [ ] Firebase Project ID
- [ ] Databázová tabulka v Supabase

## 📋 Krok za krokem

### 1. Vytvoř Firebase projekt (5 min)

1. Jdi na https://console.firebase.google.com/
2. Klikni "Add project"
3. Pojmenuj projekt (např. "Gastro Tips")
4. Disable Google Analytics (není potřeba)
5. Klikni "Create project"

### 2. Přidej Android aplikaci (3 min)

1. V Firebase Console klikni na Android ikonu (⚙️)
2. Zadej package name: **`cz.pojdsemkamjdes.app`**
3. App nickname: "Gastro Tips Android" (volitelné)
4. Klikni "Register app"
5. **STÁHNI `google-services.json`**

### 3. Ulož google-services.json (1 min)

```bash
# Zkopíruj stažený soubor sem:
android/app/google-services.json
```

Zkontroluj, že je soubor na správném místě:
```bash
ls android/app/google-services.json
# Mělo by vypsat: android/app/google-services.json
```

### 4. Získej Service Account JSON (3 min)

1. V Firebase Console → **Project Settings** (⚙️ ikona vlevo nahoře)
2. Klikni na záložku **"Service accounts"**
3. Klikni **"Generate new private key"**
4. Potvrd a **stáhni JSON soubor**

### 5. Najdi Firebase Project ID (1 min)

**Varianta A - V Firebase Console:**
- Project Settings → General → Project ID (nahoře na stránce)

**Varianta B - V google-services.json:**
```bash
# Otevři google-services.json a najdi:
"project_id": "tvuj-project-id-123"  ← toto je Project ID
```

### 6. Nastav Environment Variables (5 min)

Otevři/vytvoř soubor `.env.local` v root složce projektu a přidej:

```env
# === Supabase (už bys měl mít) ===
NEXT_PUBLIC_SUPABASE_URL=https://kkqrumygyxuefrwbpyiy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvůj-anon-key
SUPABASE_SERVICE_ROLE_KEY=tvůj-service-role-key

# === Firebase (nové) ===
FIREBASE_PROJECT_ID=tvuj-project-id-zde

# Service Account JSON jako string (pozor na formát!):
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"xxx","private_key_id":"xxx","private_key":"-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n","client_email":"xxx@xxx.iam.gserviceaccount.com","client_id":"xxx","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"xxx"}'
```

**DŮLEŽITÉ:**
- Celý Service Account JSON musí být **na jednom řádku** v jednoduchých uvozovkách
- Zkopíruj celý obsah staženého JSON souboru a dej ho do jednoduchých uvozovek

**Tip:** Pokud máš problém s formátováním, můžeš použít online nástroj pro "minify JSON" nebo toto:
```bash
# V terminálu (Linux/Mac):
cat cesta-k-souboru.json | jq -c
```

### 7. Vytvoř databázovou tabulku (2 min)

1. Otevři Supabase Dashboard
2. Jdi do **SQL Editor**
3. Otevři soubor `scripts/create-device-tokens-table.sql`
4. Zkopíruj celý obsah
5. Vlož do SQL Editoru
6. Klikni **"Run"**
7. Mělo by se zobrazit "Success"

### 8. Build a sync (3 min)

```bash
# 1. Build web assets pro mobile
npm run build:mobile

# 2. Sync s Android projektem
npx cap sync

# 3. Otevři Android Studio
npx cap open android
```

### 9. Spusť aplikaci (2 min)

V Android Studio:
1. Připoj Android zařízení nebo spusť emulátor
2. Klikni na zelený "Play" button (▶)
3. Počkej na build a instalaci

### 10. Test notifikací (2 min)

1. **Na mobilu:**
   - Spusť aplikaci
   - Povolit notifikace (když se zeptá)
   - Nech aplikaci běžet v pozadí

2. **V admin UI (na počítači):**
   - Otevři admin rozhraní (https://pojdsemkamjdes.cz/admin)
   - Přidej novou kavárnu/cukrárnu/trending/event
   - Po uložení klikni "Ano, odeslat" v dialogu

3. **Zkontroluj:**
   - Na mobilu by měla dorazit notifikace 🎉

## 🐛 Když něco nefunguje

### Notifikace nepřišla

```bash
# Zkontroluj, že se zařízení zaregistrovalo:
# 1. Otevři Supabase Dashboard
# 2. Jdi do Table Editor → device_tokens
# 3. Měl by tam být alespoň jeden záznam

# Zkontroluj API logy:
# V terminálu kde běží dev server by měly být logy z /api/notifications/send
```

### "Firebase configuration not found"

```bash
# Zkontroluj .env.local:
cat .env.local | grep FIREBASE

# Mělo by vypsat:
# FIREBASE_PROJECT_ID=...
# FIREBASE_SERVICE_ACCOUNT=...

# Pokud tam nejsou, přidej je a restartuj server:
npm run dev
```

### "Failed to get Firebase access token"

- Service Account JSON má špatný formát
- Zkontroluj, že je celý JSON na jednom řádku v jednoduchých uvozovkách
- Zkontroluj, že `\n` v private_key jsou escapované

### google-services.json nenalezen při buildu

```bash
# Zkontroluj umístění:
ls android/app/google-services.json

# Pokud tam není, zkopíruj ho tam a znovu sync:
npx cap sync
```

## 📚 Další dokumentace

- **Detailní Firebase setup:** `FIREBASE_SETUP.md`
- **Jak to celé funguje:** `PUSH_NOTIFICATIONS_README.md`

## ✨ Hotovo!

Pokud jsi prošel všemi kroky, push notifikace by měly fungovat! 🎉

Máš problém? Podívej se do troubleshooting sekce v `FIREBASE_SETUP.md` nebo zkontroluj logy.
