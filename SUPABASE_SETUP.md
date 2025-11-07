# Supabase Setup Guide

Tento návod ti pomůže nastavit Supabase databázi pro aplikaci Gastro Tips.

## 📋 Krok 1: Vytvoření Supabase projektu

1. Jdi na [supabase.com](https://supabase.com)
2. Přihlas se nebo vytvoř účet (GitHub/Google login)
3. Klikni na **"New Project"**
4. Vyplň:
   - **Name**: `gastro-tips` (nebo libovolný název)
   - **Database Password**: Vygeneruj silné heslo (uloží se automaticky)
   - **Region**: Vyber nejbližší region (např. `Central EU` pro Česko)
   - **Pricing Plan**: Vyber **Free** (stačí pro tvůj projekt)
5. Klikni **"Create new project"** a počkej ~2 minuty na vytvoření

## 🔑 Krok 2: Získání API klíčů

1. V Supabase dashboardu otevři svůj projekt
2. V levém menu klikni na **"Settings"** (ikona ozubeného kola)
3. Klikni na **"API"**
4. Zkopíruj tyto hodnoty:
   - **Project URL** (začíná `https://`)
   - **anon public** klíč (dlouhý string)

## 🔧 Krok 3: Konfigurace aplikace

1. Otevři soubor `.env.local` v projektu
2. Nahraď placeholder hodnoty:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tvuj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvuj-anon-key
```

## 🗄️ Krok 4: Vytvoření databázového schématu

1. V Supabase dashboardu klikni na **"SQL Editor"** v levém menu
2. Klikni na **"New query"**
3. Otevři soubor `supabase-schema.sql` z projektu
4. Zkopíruj celý obsah a vlož ho do SQL Editoru
5. Klikni **"Run"** (nebo Ctrl/Cmd + Enter)
6. Mělo by se zobrazit: **"Success. No rows returned"**

## ✅ Krok 5: Ověření

1. V levém menu klikni na **"Table Editor"**
2. Měl bys vidět tabulku **"restaurants"**
3. Zkontroluj sloupce:
   - id, name, location, cuisine_type, specialty, price, rating, website_url, created_at, updated_at

## 🚀 Krok 6: Restart aplikace

1. V terminálu zastav server (Ctrl+C)
2. Spusť znovu: `npm run dev`
3. Otevři http://localhost:3001
4. Zkus přidat restauraci nebo importovat CSV

## 🔒 Bezpečnost (RLS - Row Level Security)

Supabase schéma má již nakonfigurované Row Level Security:
- **Čtení (SELECT)**: Všichni můžou číst restaurace
- **Zápis (INSERT/UPDATE/DELETE)**: Všichni můžou upravovat (pro jednoduchost)

**Pro produkci** bys měl přidat autentizaci a omezit zápis pouze na přihlášené uživatele.

## 📊 Monitorování

V Supabase dashboardu máš k dispozici:
- **Table Editor**: Prohlížení a editace dat
- **SQL Editor**: Spouštění SQL dotazů
- **Database**: Přehled databáze a výkon
- **Logs**: Logy dotazů a chyb

## 💰 Free Tier Limity

Supabase Free tier zahrnuje:
- **500 MB databáze**
- **50 MB souborů** (pro budoucí fotky restaurací)
- **Neomezený počet API requestů**
- **50,000 měsíčních aktivních uživatelů**

Pro osobní projekt s desítkami restaurací je to více než dost!

## 🆘 Řešení problémů

### Error: "Missing Supabase environment variables"
- Zkontroluj, že máš správně vyplněné `.env.local`
- Restartuj dev server

### Error při SQL schématu
- Ujisti se, že máš zkopírovaný celý obsah `supabase-schema.sql`
- Zkus smazat tabulku a spustit znovu: `DROP TABLE IF EXISTS restaurants CASCADE;`

### Restaurace se neukládají
- Zkontroluj v Supabase Table Editoru, jestli se data objevují
- Otevři browser console (F12) a hledej chybové hlášky
- Zkontroluj RLS policies v Supabase → Authentication → Policies

## 🎉 Hotovo!

Teď máš plně funkční cloudovou databázi. Data jsou:
- ✅ Uložená online (nezaniknou při redeployi)
- ✅ Přístupná odkudkoliv
- ✅ Zálohovaná automaticky
- ✅ Připravená na deployment (Vercel, Netlify, atd.)
