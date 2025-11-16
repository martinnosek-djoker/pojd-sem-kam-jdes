import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.pojdsemkamjdes.cz'

  const routes = [
    '',
    '/pobliz',
    '/lokality',
    '/kuchyne',
    '/cukrarny',
    '/kavarny',
    '/akce',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))
}
