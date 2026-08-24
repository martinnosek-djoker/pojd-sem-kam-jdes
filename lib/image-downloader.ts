/**
 * Helper utility for downloading images from URLs and storing them locally
 * Used by API endpoints to automatically convert external image URLs to local paths
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

/**
 * Normalize filename (must match normalizeFileName in api-config.ts and scripts)
 */
export function normalizeFileName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get file extension from URL or content type
 */
function getFileExtension(url: string, contentType?: string): string {
  // Try to get extension from URL
  try {
    const urlPath = new URL(url).pathname;
    const urlExt = path.extname(urlPath).toLowerCase();
    if (urlExt && ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(urlExt)) {
      return urlExt;
    }
  } catch (e) {
    // Invalid URL, continue to content type check
  }

  // Fallback to content type
  if (contentType) {
    const mimeTypes: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif'
    };
    return mimeTypes[contentType] || '.jpg';
  }

  return '.jpg';
}

/**
 * Download image from URL
 */
function downloadImage(url: string): Promise<{ buffer: Buffer; contentType?: string }> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        if (response.headers.location) {
          downloadImage(response.headers.location).then(resolve).catch(reject);
        } else {
          reject(new Error('Redirect without location header'));
        }
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          contentType: response.headers['content-type']
        });
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Download and save image locally, return local path
 *
 * @param imageUrl - External image URL (e.g. Google Photos URL)
 * @param name - Item name (restaurant/cafe/bakery name)
 * @param id - Item ID (for unique filename)
 * @param category - Category folder (restaurants/cafes/bakeries/trendings)
 * @returns Local path (e.g. /images/restaurants/campo-de-fiori.webp) or null if failed
 */
export async function downloadAndSaveImage(
  imageUrl: string | null | undefined,
  name: string,
  id: number,
  category: 'restaurants' | 'cafes' | 'bakeries' | 'trendings'
): Promise<string | null> {
  // No URL provided
  if (!imageUrl) {
    return null;
  }

  // Already a local path
  if (imageUrl.startsWith('/images/')) {
    return imageUrl;
  }

  // Not an HTTP(S) URL - return as-is
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  try {
    console.log(`[Image Downloader] Downloading ${name} from ${imageUrl.substring(0, 60)}...`);

    // Download the image
    const { buffer, contentType } = await downloadImage(imageUrl);

    // Skip tiny images (likely placeholders)
    if (buffer.length < 1024) {
      console.log(`[Image Downloader] Image too small (${buffer.length}B), skipping`);
      return imageUrl; // Keep original URL
    }

    // Prepare filename
    const normalizedName = normalizeFileName(name);
    const extension = getFileExtension(imageUrl, contentType);
    const fileName = `${normalizedName}${extension}`;

    // Ensure directory exists
    const targetDir = path.join(process.cwd(), 'public', 'images', category);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const localPath = `/images/${category}/${fileName}`;
    console.log(`[Image Downloader] Saved to ${localPath} (${(buffer.length / 1024).toFixed(1)} KB)`);

    return localPath;
  } catch (error) {
    console.error(`[Image Downloader] Failed to download ${name}:`, error);
    // Return original URL as fallback
    return imageUrl;
  }
}
