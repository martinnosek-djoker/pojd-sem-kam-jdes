#!/usr/bin/env node
import { renameSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { MOBILE_EXCLUDED_PATHS } from './mobile-excluded-paths.mjs';



console.log('🔧 Preparing for mobile build...');

// Create temp backup directory outside app folder
const backupDir = join(process.cwd(), '.temp-api-backup');
if (!existsSync(backupDir)) {
  mkdirSync(backupDir, { recursive: true });
}

for (const route of MOBILE_EXCLUDED_PATHS) {
  const fullPath = join(process.cwd(), route);
  // Move to temp directory outside app folder to avoid Next.js compilation
  const backupPath = join(backupDir, route.replace(/\//g, '_'));

  if (existsSync(fullPath)) {
    console.log(`  ↳ Excluding ${route}`);
    renameSync(fullPath, backupPath);
  }
}

console.log('✓ Mobile build preparation complete\n');
