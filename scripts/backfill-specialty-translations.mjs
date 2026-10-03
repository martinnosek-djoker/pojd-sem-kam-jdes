#!/usr/bin/env node
// One-off: translate existing cafe/restaurant `specialty` values into the new
// `specialty_en` column. Only ever writes that single column (never a full-row
// update) and skips rows that already have a translation.
//
//   node scripts/backfill-specialty-translations.mjs          # dry run (lists work)
//   node scripts/backfill-specialty-translations.mjs --apply  # translate + write
import { readFileSync } from "fs";
import Anthropic from "@anthropic-ai/sdk";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .map((l) => l.match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]])
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const apply = process.argv.includes("--apply");
const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

async function translate(text) {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    messages: [{ role: "user", content: text }],
    system:
      "You translate short lists of dishes/drinks recommended at Prague cafes and restaurants from Czech to natural English menu wording. " +
      "Use the normal English name where one exists (turecká vejce = Turkish eggs, párky = sausages, kremrole = cream horn). " +
      "For traditional Czech foods with no real English equivalent (e.g. špička, věneček, větrník, svíčková), keep the Czech name and add a brief descriptor such as 'Czech classic', e.g. 'špička (Czech classic cake)'. " +
      "Keep foreign loanword dishes and proper nouns unchanged. Keep the same comma-separated structure. " +
      "Reply with ONLY the translation, no preamble, no quotes.",
  });
  return msg.content[0].type === "text" ? msg.content[0].text.trim() : null;
}

for (const table of ["cafes", "restaurants"]) {
  const res = await fetch(
    `${url}/rest/v1/${table}?select=id,name,specialty,specialty_en&specialty=not.is.null&specialty=neq.&specialty_en=is.null`,
    { headers }
  );
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error(`${table}: ${JSON.stringify(rows)}`);
  console.log(`\n${table}: ${rows.length} to translate`);

  for (const row of rows) {
    if (!apply) {
      console.log(`  - [${row.id}] ${row.name}: "${row.specialty}"`);
      continue;
    }
    const en = await translate(row.specialty);
    if (!en) {
      console.log(`  ! [${row.id}] ${row.name}: translation failed, skipped`);
      continue;
    }
    const upd = await fetch(`${url}/rest/v1/${table}?id=eq.${row.id}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ specialty_en: en }),
    });
    console.log(`  ${upd.ok ? "✓" : "✗"} [${row.id}] ${row.name}: "${row.specialty}" -> "${en}"`);
  }
}
