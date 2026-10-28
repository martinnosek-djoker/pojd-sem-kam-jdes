#!/usr/bin/env node
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { renameSync, cpSync, rmSync } from 'fs';

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

// Tracks whether the configs are currently swapped, so the cleanup in `finally`
// can't restore a second time (that second rename moved the web config over
// next.config.mobile.mjs and deleted next.config.mjs).
let configsSwapped = false;

async function swapConfigs() {
  // Swap next.config.mjs with next.config.mobile.mjs for mobile build
  renameSync(join(rootDir, 'next.config.mjs'), join(rootDir, 'next.config.web.mjs'));
  renameSync(join(rootDir, 'next.config.mobile.mjs'), join(rootDir, 'next.config.mjs'));
  configsSwapped = true;
}

async function restoreConfigs() {
  if (!configsSwapped) return;
  configsSwapped = false;
  // Restore original config files
  renameSync(join(rootDir, 'next.config.mjs'), join(rootDir, 'next.config.mobile.mjs'));
  renameSync(join(rootDir, 'next.config.web.mjs'), join(rootDir, 'next.config.mjs'));
}

async function buildMobile() {
  try {
    // Step 1: Prepare (exclude dynamic API routes)
    await runCommand('node scripts/prepare-mobile-build.mjs', 'Preparing mobile build');

    // (Place photos are no longer bundled or downloaded here: the app loads them live from the
    // website, so new places/photos don't need an app release. See lib/api-config.ts.)

    // The mobile build reads the database through Next's fetch cache (the no-store client would
    // break the static export), and that cache survives between builds: a build once baked in
    // events from weeks earlier. Start every mobile build from a cold data cache.
    rmSync(join(rootDir, '.next', 'cache', 'fetch-cache'), { recursive: true, force: true });

    // Step 4: Swap config files for mobile build
    console.log('\n🔄 Swapping config files for mobile build...');
    await swapConfigs();

    // Step 5: Build with Next.js (using mobile config)
    await runCommand('MOBILE_BUILD=true next build', 'Building Next.js app for mobile');

    // Step 6: Restore config files
    console.log('\n🔄 Restoring config files...');
    await restoreConfigs();

    // Step 7: Sync with Capacitor
    await runCommand('npx cap sync android', 'Syncing with Capacitor (Android)');

    // Step 8: Android resources that live in git (the android/ folder itself is ignored),
    // e.g. the localized push notification texts
    cpSync(join(rootDir, 'resources', 'android-res'), join(rootDir, 'android', 'app', 'src', 'main', 'res'), { recursive: true });
    console.log('✓ Copied resources/android-res into the Android project');

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
