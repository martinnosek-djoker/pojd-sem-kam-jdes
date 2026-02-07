#!/usr/bin/env node
import fetch from 'node-fetch';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://pojdsemkamjdes.cz';

// Normalization must match normalizeFileName in api-config.ts
function normalizeFileName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function downloadImage(url, targetPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`  ⏭️  Skipping ${url} - HTTP ${response.status}`);
      return false;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Skip tiny images (likely errors or placeholders)
    if (buffer.length < 1024) {
      console.log(`  ⏭️  Skipping ${url} - too small (${buffer.length}B)`);
      return false;
    }

    // Ensure directory exists
    const dir = dirname(targetPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(targetPath, buffer);
    console.log(`  ✓ Downloaded ${url.substring(0, 80)}... → ${targetPath}`);
    return true;
  } catch (error) {
    console.log(`  ✗ Failed ${url}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('📥 Downloading review images...\n');

  // Fetch reviews
  const reviewsRes = await fetch(`${BASE_URL}/api/reviews`);
  const reviews = await reviewsRes.json();

  console.log(`Found ${reviews.length} reviews\n`);

  let totalImages = 0;
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const review of reviews) {
    const reviewId = review.id;
    const restaurantName = review.restaurant?.name || `review-${reviewId}`;
    const normalizedName = normalizeFileName(restaurantName);

    console.log(`\n📝 Review #${reviewId}: ${restaurantName}`);

    if (!review.images || review.images.length === 0) {
      console.log('  ⏭️  No images');
      continue;
    }

    const targetDir = join(process.cwd(), 'public', 'images', 'reviews', String(reviewId));

    for (let i = 0; i < review.images.length; i++) {
      const imageUrl = review.images[i];
      totalImages++;

      // Skip if already a local path
      if (imageUrl.startsWith('/images/')) {
        console.log(`  ⏭️  Already local: ${imageUrl}`);
        skipped++;
        continue;
      }

      // Generate target filename
      const extension = imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)?.[1] || 'webp';
      const fileName = i === 0
        ? `${normalizedName}.${extension}`
        : `${normalizedName}-${i + 1}.${extension}`;
      const targetPath = join(targetDir, fileName);

      // Skip if already exists
      if (existsSync(targetPath)) {
        console.log(`  ⏭️  Already exists: ${targetPath}`);
        skipped++;
        continue;
      }

      // Download
      const success = await downloadImage(imageUrl, targetPath);
      if (success) {
        downloaded++;
      } else {
        failed++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`  Total images:     ${totalImages}`);
  console.log(`  Downloaded:       ${downloaded}`);
  console.log(`  Already local:    ${skipped}`);
  console.log(`  Failed:           ${failed}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
