#!/usr/bin/env node
import { renameSync, existsSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { MOBILE_EXCLUDED_PATHS } from './mobile-excluded-paths.mjs';

console.log('🔧 Restoring API routes after mobile build...');

const backupDir = join(process.cwd(), '.temp-api-backup');

if (existsSync(backupDir)) {
  for (const route of MOBILE_EXCLUDED_PATHS) {
    const originalPath = join(process.cwd(), route);
    const backupPath = join(backupDir, route.replace(/\//g, '_'));

    if (existsSync(backupPath)) {
      console.log(`  ↳ Restoring ${route}`);
      renameSync(backupPath, originalPath);
    }
  }

  // Clean up the temp backup directory - but only when it is empty: anything still in there
  // wasn't restored, and deleting it would lose it for good.
  const left = readdirSync(backupDir);
  if (left.length > 0) {
    console.log(`  ⚠️  Not restored, kept in ${backupDir}: ${left.join(', ')}`);
    process.exitCode = 1;
  } else {
    try {
      rmSync(backupDir, { recursive: true, force: true });
    } catch (error) {
      console.log(`  ⚠️  Could not remove temp backup directory: ${error.message}`);
    }
  }
}

console.log('✓ API routes restored\n');
