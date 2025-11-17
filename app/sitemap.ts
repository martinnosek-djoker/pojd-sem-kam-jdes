import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.pojdsemkamjdes.cz'

  const routes = [
    { path: '', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/pobliz', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/lokality', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/kuchyne', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/cukrarny', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/kavarny', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/akce', priority: 0.9, changeFrequency: 'daily' as const }, // Vyšší priorita - unikátní obsah, častější aktualizace
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
