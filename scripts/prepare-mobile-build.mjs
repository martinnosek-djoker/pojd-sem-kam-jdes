#!/usr/bin/env node
import { renameSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const API_ROUTES_TO_EXCLUDE = [
  'app/api/cafes/[id]',
  'app/api/restaurants/[id]',
  'app/api/admin/events/[id]',
  'app/api/trendings/[id]',
  'app/api/michelin/[id]',
  'app/api/reviews/[id]',
  'app/api/bakeries/[id]',
  'app/api/breakfasts',
  'app/api/story/[slug]',
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
