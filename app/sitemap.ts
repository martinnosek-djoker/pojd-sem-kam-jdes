import { MetadataRoute } from 'next'
import { getApiUrl } from '@/lib/api-config'
import { createReviewSlug } from '@/lib/slug'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pojdsemkamjdes.cz'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/akce`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kavarny`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cukrarny`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lokality`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kuchyne`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pobliz`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/trendy`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/michelin`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Fetch reviews for dynamic pages
  let reviewPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(getApiUrl('/api/reviews'), {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    if (res.ok) {
      const reviews = await res.json()
      reviewPages = reviews.map((review: any) => ({
        url: `${baseUrl}/recenze/${createReviewSlug(review.id, review.restaurant?.name || review.cafe?.name || 'review')}`,
        lastModified: new Date(review.updated_at || review.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Error fetching reviews for sitemap:', error)
  }

  return [...staticPages, ...reviewPages]
}
