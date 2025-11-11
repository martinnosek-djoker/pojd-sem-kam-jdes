import { MetadataRoute } from 'next'
import { locales } from '@/i18n'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.pojdsemkamjdes.cz'
  const now = new Date()

  const routes = [
    { path: '', priority: 1, changeFrequency: 'daily' as const },
    { path: '/pobliz', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/lokality', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/kuchyne', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/cukrarny', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/kavarny', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/akce', priority: 0.6, changeFrequency: 'weekly' as const },
  ]

  // Generate sitemap entries for all locales
  return routes.flatMap(route =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [l, `${baseUrl}/${l}${route.path}`])
        ),
      },
    }))
  )
}
