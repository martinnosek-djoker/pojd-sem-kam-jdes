#!/usr/bin/env node
import { renameSync, existsSync } from 'fs';
import { join } from 'path';

const API_ROUTES_TO_EXCLUDE = [
  'app/api/cafes/[id]',
  'app/api/restaurants/[id]',
  'app/api/admin/events/[id]',
  'app/api/trendings/[id]',
  'app/api/michelin/[id]',
  'app/api/reviews/[id]',
  'app/api/bakeries/[id]',
  'app/api/breakfasts',
];

console.log('🔧 Preparing for mobile build...');

for (const route of API_ROUTES_TO_EXCLUDE) {
  const fullPath = join(process.cwd(), route);
  const backupPath = `${fullPath}.backup`;

  if (existsSync(fullPath)) {
    console.log(`  ↳ Excluding ${route}`);
    renameSync(fullPath, backupPath);
  }
}

console.log('✓ Mobile build preparation complete\n');
