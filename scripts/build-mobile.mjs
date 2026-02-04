#!/usr/bin/env node
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runCommand(command, description) {
  console.log(`\n🚀 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: join(__dirname, '..') });
  } catch (error) {
    throw new Error(`Failed: ${description}`);
  }
}

async function buildMobile() {
  try {
    // Step 1: Prepare (exclude dynamic API routes)
    await runCommand('node scripts/prepare-mobile-build.mjs', 'Preparing mobile build');

    // Step 2: Download all images for offline use
    await runCommand('node scripts/download-all-images.mjs', 'Downloading images for all categories');

    // Step 3: Generate reviews cache
    await runCommand('node scripts/generate-reviews-data.mjs', 'Generating reviews cache');

    // Step 4: Build with Next.js
    await runCommand('MOBILE_BUILD=true next build', 'Building Next.js app');

    // Step 5: Sync with Capacitor
    await runCommand('npx cap sync', 'Syncing with Capacitor');

    console.log('\n✅ Mobile build completed successfully!\n');
  } catch (error) {
    console.error(`\n❌ Build failed: ${error.message}\n`);
    process.exitCode = 1;
  } finally {
    // Always restore API routes, even if build failed
    try {
      await runCommand('node scripts/restore-after-mobile-build.mjs', 'Restoring API routes');
    } catch (restoreError) {
      console.error(`\n⚠️  Warning: Failed to restore API routes: ${restoreError.message}`);
      console.error('You may need to run: node scripts/restore-after-mobile-build.mjs manually\n');
    }
  }
}

buildMobile();
