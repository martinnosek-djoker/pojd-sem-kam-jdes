#!/usr/bin/env node

const categories = [
  { name: 'cafes', endpoint: '/api/cafes' },
  { name: 'bakeries', endpoint: '/api/bakeries' },
  { name: 'michelin_restaurants', endpoint: '/api/michelin' },
  { name: 'trendings', endpoint: '/api/trendings' }
];

const BASE_URL = 'https://pojdsemkamjdes.cz';

async function checkCategory(cat) {
  try {
    const response = await fetch(BASE_URL + cat.endpoint, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const items = await response.json();

    let withImages = 0;
    let googleUrls = 0;
    let localPaths = 0;
    let noImage = 0;

    items.forEach(item => {
      if (!item.image_url) {
        noImage++;
      } else if (item.image_url.startsWith('/images/')) {
        localPaths++;
      } else if (item.image_url.includes('googleapis.com') || item.image_url.includes('googleusercontent.com')) {
        googleUrls++;
      }
      if (item.image_url) withImages++;
    });

    console.log('\n📊', cat.name.toUpperCase());
    console.log('  Celkem:', items.length);
    console.log('  📍 Lokální cesty:', localPaths);
    console.log('  🌐 Google URLs:', googleUrls);
    console.log('  ❌ Bez obrázku:', noImage);
  } catch (error) {
    console.error('❌', cat.name, ':', error.message);
  }
}

(async () => {
  console.log('🔍 Kontrola všech kategorií:\n');
  for (const cat of categories) {
    await checkCategory(cat);
  }
})();
