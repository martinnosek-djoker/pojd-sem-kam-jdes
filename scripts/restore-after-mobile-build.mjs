#!/usr/bin/env node
import { renameSync, existsSync } from 'fs';
import { join } from 'path';
import { readdirSync } from 'fs';

console.log('🔧 Restoring API routes after mobile build...');

function findBackups(dir) {
  const backups = [];

  function scan(currentDir) {
    try {
      const items = readdirSync(currentDir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = join(currentDir, item.name);

        if (item.isDirectory()) {
          if (item.name.endsWith('.backup')) {
            backups.push(fullPath);
          } else {
            scan(fullPath);
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  scan(dir);
  return backups;
}

const appDir = join(process.cwd(), 'app');
const backups = findBackups(appDir);

for (const backupPath of backups) {
  const originalPath = backupPath.replace('.backup', '');
  console.log(`  ↳ Restoring ${originalPath.replace(process.cwd() + '/', '')}`);
  renameSync(backupPath, originalPath);
}

console.log('✓ API routes restored\n');
