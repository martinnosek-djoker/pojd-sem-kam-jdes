#!/usr/bin/env node
import { renameSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const API_ROUTES_TO_EXCLUDE = [
  'app/api/cafes/[id]',
  'app/api/restaurants/[id]',
  'app/api/admin/events/[id]',
  'app/api/trendings/[id]',
  'app/api/bakeries/[id]',
  'app/api/breakfasts',
  'app/api/visits/[id]',
  // Admin-only address autocomplete (LocationAddressFields) added after this
  // list was last updated - reads a query param, so it fails static export.
  'app/api/geocode',
  // Dynamic detail pages (restaurant/cafe/visit) - not part of the static app,
  // whose cards link out instead (see IS_STATIC_APP in lib/slug.ts).
  'app/restaurace',
  'app/navstevy',
  'app/kavarny/[slug]',
  'app/en/restaurace',
  'app/en/navstevy',
  'app/en/kavarny/[slug]',
];

console.log('🔧 Preparing for mobile build...');

// Create temp backup directory outside app folder
const backupDir = join(process.cwd(), '.temp-api-backup');
if (!existsSync(backupDir)) {
  mkdirSync(backupDir, { recursive: true });
}

for (const route of API_ROUTES_TO_EXCLUDE) {
  const fullPath = join(process.cwd(), route);
  // Move to temp directory outside app folder to avoid Next.js compilation
  const backupPath = join(backupDir, route.replace(/\//g, '_'));

  if (existsSync(fullPath)) {
    console.log(`  ↳ Excluding ${route}`);
    renameSync(fullPath, backupPath);
  }
}

console.log('✓ Mobile build preparation complete\n');
