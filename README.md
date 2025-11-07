# Gastronomická mapa Prahy

Webová aplikace pro správu a sdílení doporučení restaurací v Praze.

## 🚀 Rychlý start

### 1. Nastavení Supabase databáze

**Před spuštěním aplikace musíš nastavit Supabase:**

📖 **Následuj návod v souboru [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)**

Stručně:
1. Vytvoř Supabase projekt na [supabase.com](https://supabase.com)
2. Zkopíruj API klíče do `.env.local`
3. Spusť SQL schéma ze souboru `supabase-schema.sql`

### 2. Spuštění aplikace

```bash
# Nainstalovat závislosti (pokud ještě nebyly)
npm install

# Spustit development server
npm run dev
```

Aplikace bude dostupná na: **http://localhost:3000** (nebo 3001, pokud je 3000 obsazený)

### 3. První kroky

1. **Veřejná stránka**: Otevřete http://localhost:3000
   - Zatím prázdná, je potřeba naimportovat data

2. **Přihlášení do administrace**: http://localhost:3000/admin/login
   - Výchozí heslo: `admin123` (lze změnit v `.env.local`)

3. **Import vašich dat**:
   - Po přihlášení klikněte na "📤 Import CSV"
   - Nahrajte svůj CSV soubor z Google Sheets
   - Importované restaurace se objeví na veřejné stránce

## 📁 Struktura projektu

```
gastro-tips/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Veřejná stránka
│   ├── admin/               # Admin sekce
│   │   ├── page.tsx        # Dashboard
│   │   ├── login/          # Přihlášení
│   │   └── import/         # CSV import
│   └── api/                 # API endpointy
├── components/              # React komponenty
├── lib/                     # Knihovny a utility
│   ├── db.ts               # Databázové funkce (Supabase)
│   ├── supabase.ts         # Supabase client
│   ├── auth.ts             # Autentizace
│   └── csv-parser.ts       # CSV parser
├── supabase-schema.sql      # SQL schéma pro Supabase
├── SUPABASE_SETUP.md        # Návod na setup Supabase
└── .env.local              # Konfigurace (heslo, API klíče)
```

## 🔧 Konfigurace

### Změna hesla do administrace

Upravte soubor `.env.local`:

```env
ADMIN_PASSWORD=vase-nove-heslo
```

## 📥 Import CSV

### Formát CSV souboru

CSV soubor musí obsahovat tyto sloupce (začínající od řádku 4):

- **Sloupec F**: Název restaurace (povinný)
- **Sloupec G**: Lokalita (povinný)
- **Sloupec H**: Typ kuchyně (povinný)
- **Sloupec I**: Specializace (nepovinné)
- **Sloupec J**: Cena za osobu v Kč (povinné, číslo)
- **Sloupec K**: Hodnocení (povinné, formát: "9/10" nebo "9")

### Jak exportovat z Google Sheets

1. Otevřete váš Google Sheets dokument
2. Klikněte na "Soubor" → "Stáhnout" → "Hodnoty oddělené čárkami (.csv)"
3. Nahrajte stažený soubor v admin sekci

## 🎯 Funkce

### Veřejná část
- ✅ Zobrazení všech restaurací
- ✅ Filtrování podle lokality a typu kuchyně
- ✅ Řazení podle hodnocení, ceny nebo názvu
- ✅ Responzivní design (mobil + desktop)
- ✅ Odkazy na web/Instagram restaurací

### Admin sekce
- ✅ Přihlášení heslem
- ✅ Přidání nové restaurace
- ✅ Úprava existující restaurace
- ✅ Smazání restaurace
- ✅ CSV import (jednorázový import dat)
- ✅ Přehledná tabulka se všemi restauracemi

## 🛠 Technologie

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL databáze)
- **React Hook Form** + **Zod** (validace formulářů)

## 📦 Deployment

### Vercel (doporučeno)

1. **Připrav Supabase projekt** (pokud ještě nemáš):
   - Následuj [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
   - Supabase bude fungovat jak lokálně, tak v produkci

2. **Nahraj projekt na GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

3. **Deploy na Vercel**:
   - Jdi na [vercel.com](https://vercel.com)
   - Připoj GitHub repository
   - Nastav **Environment Variables**:
     ```
     ADMIN_PASSWORD=your-secure-password
     AUTH_SECRET=random-secret-string
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```
   - Klikni **Deploy**

4. **Hotovo!** Aplikace běží na `https://your-project.vercel.app`

### Netlify

Podobný postup jako u Vercelu - jen nastav stejné environment variables.

### Lokální produkční build

```bash
npm run build
npm run start
```

## 🔒 Bezpečnost

- Admin sekce je chráněná heslem (cookie-based autentizace)
- Výchozí heslo: `admin123` - **ZMĚŇTE V PRODUKCI!**
- Supabase Row Level Security (RLS) je aktivní
- API klíče jsou v `.env.local` (v `.gitignore`, nebudou v Gitu)

## 📝 Další možná vylepšení

- [ ] Přidání fotografií restaurací
- [ ] Export dat (backup)
- [ ] Pokročilé filtrování (cenové rozmezí, text search)
- [ ] Možnost přidat poznámky k návštěvám
- [ ] Oblíbené restaurace (favorites)
- [ ] Mapa s lokacemi restaurací
- [ ] PWA (mobilní aplikace)

## 🐛 Řešení problémů

### Error: "Missing Supabase environment variables"
- Zkontroluj `.env.local` - musí obsahovat `NEXT_PUBLIC_SUPABASE_URL` a `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restartuj dev server po změně `.env.local`

### Port 3000 je obsazený
```bash
# Next.js automaticky použije jiný port (3001, 3002...)
# Nebo můžeš zastavit proces na portu 3000
lsof -ti:3000 | xargs kill
```

### Restaurace se neuloží / neobjeví
- Zkontroluj v Supabase Table Editoru, jestli se data ukládají
- Otevři browser console (F12) a hledej chybové hlášky
- Zkontroluj, že máš správně nastavený SQL schéma

### CSV import nefunguje
- Ujisti se, že CSV má správnou strukturu (sloupce E-J)
- První 3 řádky jsou přeskočeny (hlavičky)
- Prázdné řádky jsou ignorovány
- Zkontroluj browser console pro detailní chyby

## 📞 Kontakt

Pro otázky a návrhy vytvořte issue nebo pull request.
