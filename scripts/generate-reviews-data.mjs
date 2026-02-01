import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateReviewsData() {
  try {
    // Fetch reviews from production API
    const url = 'https://pojdsemkamjdes.cz/api/reviews';
    console.log(`Fetching reviews from ${url}...`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      console.log(`HTTP error ${response.status}, creating empty file`);
      writeFileSync(
        join(__dirname, '../.reviews-cache.json'),
        JSON.stringify([])
      );
      return;
    }

    const reviews = await response.json();

    // Save to cache file
    writeFileSync(
      join(__dirname, '../.reviews-cache.json'),
      JSON.stringify(reviews)
    );

    console.log(`✓ Generated reviews cache with ${reviews.length} reviews`);
  } catch (error) {
    console.error('Error generating reviews data:', error.message);
    // Create empty file on error
    writeFileSync(
      join(__dirname, '../.reviews-cache.json'),
      JSON.stringify([])
    );
  }
}

generateReviewsData();
