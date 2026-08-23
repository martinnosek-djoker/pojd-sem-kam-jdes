#!/usr/bin/env node
import { renameSync, existsSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';

const API_ROUTES_TO_RESTORE = [
  'app/api/cafes/[id]',
  'app/api/restaurants/[id]',
  'app/api/admin/events/[id]',
  'app/api/trendings/[id]',
  'app/api/michelin/[id]',
  'app/api/bakeries/[id]',
  'app/api/breakfasts',
];

console.log('🔧 Restoring API routes after mobile build...');

const backupDir = join(process.cwd(), '.temp-api-backup');

if (existsSync(backupDir)) {
  for (const route of API_ROUTES_TO_RESTORE) {
    const originalPath = join(process.cwd(), route);
    const backupPath = join(backupDir, route.replace(/\//g, '_'));

    if (existsSync(backupPath)) {
      console.log(`  ↳ Restoring ${route}`);
      renameSync(backupPath, originalPath);
    }
  }

  // Clean up temp backup directory
  try {
    rmSync(backupDir, { recursive: true, force: true });
  } catch (error) {
    console.log(`  ⚠️  Could not remove temp backup directory: ${error.message}`);
  }
}

console.log('✓ API routes restored\n');
