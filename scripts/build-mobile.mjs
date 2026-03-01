#!/usr/bin/env node
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { renameSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function runCommand(command, description) {
  console.log(`\n🚀 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: rootDir });
  } catch (error) {
    throw new Error(`Failed: ${description}`);
  }
}

async function swapConfigs() {
  // Swap next.config.mjs with next.config.mobile.mjs for mobile build
  renameSync(join(rootDir, 'next.config.mjs'), join(rootDir, 'next.config.web.mjs'));
  renameSync(join(rootDir, 'next.config.mobile.mjs'), join(rootDir, 'next.config.mjs'));
}

async function restoreConfigs() {
  // Restore original config files
  renameSync(join(rootDir, 'next.config.mjs'), join(rootDir, 'next.config.mobile.mjs'));
  renameSync(join(rootDir, 'next.config.web.mjs'), join(rootDir, 'next.config.mjs'));
}

async function buildMobile() {
  try {
    // Step 1: Prepare (exclude dynamic API routes)
    await runCommand('node scripts/prepare-mobile-build.mjs', 'Preparing mobile build');

    // Step 2: Download all images for offline use
    await runCommand('node scripts/download-all-images.mjs', 'Downloading images for all categories');

    // Step 2.5: Download review images for offline use
    await runCommand('node scripts/download-review-images.mjs', 'Downloading review images');

    // Step 3: Generate reviews cache
    await runCommand('node scripts/generate-reviews-data.mjs', 'Generating reviews cache');

    // Step 4: Swap config files for mobile build
    console.log('\n🔄 Swapping config files for mobile build...');
    await swapConfigs();

    // Step 5: Build with Next.js (using mobile config)
    await runCommand('MOBILE_BUILD=true next build', 'Building Next.js app for mobile');

    // Step 5.5: Copy review images to out directory (Next.js doesn't auto-copy them)
    await runCommand('cp -r public/images/reviews out/images/', 'Copying review images to build output');

    // Step 6: Restore config files
    console.log('\n🔄 Restoring config files...');
    await restoreConfigs();

    // Step 7: Sync with Capacitor
    await runCommand('npx cap sync', 'Syncing with Capacitor');

    console.log('\n✅ Mobile build completed successfully!\n');
  } catch (error) {
    console.error(`\n❌ Build failed: ${error.message}\n`);
    process.exitCode = 1;
  } finally {
    // Always restore config files and API routes, even if build failed
    try {
      console.log('\n🔄 Restoring config files (cleanup)...');
      await restoreConfigs();
    } catch (restoreError) {
      console.error(`\n⚠️  Warning: Failed to restore config files: ${restoreError.message}`);
    }

    try {
      await runCommand('node scripts/restore-after-mobile-build.mjs', 'Restoring API routes');
    } catch (restoreError) {
      console.error(`\n⚠️  Warning: Failed to restore API routes: ${restoreError.message}`);
      console.error('You may need to run: node scripts/restore-after-mobile-build.mjs manually\n');
    }
  }
}

buildMobile();
