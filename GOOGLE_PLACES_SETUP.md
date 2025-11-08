# Google Places API Setup

Tento návod ti pomůže nastavit Google Places API pro automatické načítání fotek restaurací.

## 1. Vytvoř Google Cloud projekt

1. Jdi na [Google Cloud Console](https://console.cloud.google.com/)
2. Přihlaš se pomocí Google účtu
3. Klikni na **Select a project** → **New Project**
4. Zadej název projektu (např. "Gastro Tips")
5. Klikni **Create**

## 2. Aktivuj Places API

1. V levém menu naviguj na **APIs & Services** → **Library**
2. Vyhledej **"Places API"**
3. Klikni na **Places API**
4. Klikni na tlačítko **Enable**

## 3. Vytvoř API klíč

1. V levém menu naviguj na **APIs & Services** → **Credentials**
2. Klikni na **+ CREATE CREDENTIALS** → **API key**
3. Zkopíruj vygenerovaný API klíč
4. **(Doporučeno)** Klikni na **Edit API key** a:
   - **Application restrictions**: Nastav na "HTTP referrers" a přidej:
     - `http://localhost:3000/*` (pro lokální development)
     - `https://your-domain.com/*` (tvoje produkční doména)
   - **API restrictions**: Vyber "Restrict key" a zaškrtni pouze **Places API**
   - Klikni **Save**

## 4. Přidej API klíč do projektu

1. Otevři soubor `.env.local` v kořenové složce projektu
2. Najdi řádek:
   ```
   GOOGLE_PLACES_API_KEY=your-google-places-api-key-here
   ```
3. Nahraď `your-google-places-api-key-here` svým skutečným API klíčem
4. **Restartuj development server** (Ctrl+C a pak `npm run dev`)

## 5. Free tier limity

Google nabízí **28,000 požadavků měsíčně zdarma** pro Places API.

- **Text Search**: $17 za 1000 requestů (po free tieru)
- **Place Photo**: $7 za 1000 requestů (po free tieru)

Pro běžné použití by měl free tier bohatě stačit.

## Jak to funguje?

1. V admin rozhraní při přidávání/editaci restaurace vyplň **název** a **lokalitu**
2. Klikni na tlačítko **🔍 Auto-fetch** u pole "URL fotky"
3. API automaticky:
   - Najde restauraci v Google Maps
   - Načte její první fotografii
   - Vyplní URL do formuláře
4. Můžeš si fotku prohlédnout v náhledu
5. Po uložení se fotka zobrazí na kartě restaurace na hlavní stránce

## Řešení problémů

### "Google Places API klíč není nastaven"
- Zkontroluj, že je API klíč správně zadaný v `.env.local`
- Restartuj development server

### "Restaurace nenalezena"
- Zkus zadat přesnější název restaurace
- Přidej lokalitu (např. "Praha 1" místo jen "Praha")

### "Pro tuto restauraci nejsou dostupné fotografie"
- Restaurace nemá fotky na Google Maps
- Můžeš zadat URL vlastní fotky ručně

## Bez Google Places API

Aplikace funguje i **bez** Google Places API! Stačí:
1. Zadat URL fotky ručně do pole "URL fotky"
2. Nebo nechat pole prázdné - zobrazí se placeholder (🍽️ emoji)
