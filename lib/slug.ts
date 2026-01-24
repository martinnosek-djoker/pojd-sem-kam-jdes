// Utility functions for URL slugs

/**
 * Converts a string to a URL-friendly slug
 * Handles Czech characters and special characters
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace Czech characters
    .replace(/[áä]/g, 'a')
    .replace(/[čć]/g, 'c')
    .replace(/[ď]/g, 'd')
    .replace(/[éěë]/g, 'e')
    .replace(/[íï]/g, 'i')
    .replace(/[ň]/g, 'n')
    .replace(/[óö]/g, 'o')
    .replace(/[řŕ]/g, 'r')
    .replace(/[šś]/g, 's')
    .replace(/[ť]/g, 't')
    .replace(/[úůü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[ž]/g, 'z')
    // Remove special characters
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces and multiple dashes with single dash
    .replace(/[\s]+/g, '-')
    .replace(/[-]+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '');
}

/**
 * Creates a review slug from review ID and restaurant name
 * Format: {id}-{restaurant-name-slug}
 * Example: 1-field-restaurant
 */
export function createReviewSlug(reviewId: number, restaurantName: string): string {
  const nameSlug = slugify(restaurantName);
  return `${reviewId}-${nameSlug}`;
}

/**
 * Extracts review ID from a slug
 * Expects format: {id}-{restaurant-name-slug}
 */
export function getReviewIdFromSlug(slug: string): number | null {
  const parts = slug.split('-');
  const id = parseInt(parts[0], 10);
  return isNaN(id) ? null : id;
}
