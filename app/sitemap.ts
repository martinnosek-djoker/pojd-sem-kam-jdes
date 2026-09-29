import { MetadataRoute } from 'next'

const baseUrl = 'https://www.pojdsemkamjdes.cz'

// Each entry gets both its Czech and English URL in the sitemap, each
// pointing at the other via hreflang alternates.
function localizedPair(
  csPath: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number
): MetadataRoute.Sitemap {
  const csUrl = csPath === '/' ? baseUrl : `${baseUrl}${csPath}`
  const enUrl = csPath === '/' ? `${baseUrl}/en` : `${baseUrl}/en${csPath}`
  const alternates = { languages: { cs: csUrl, en: enUrl } }

  return [
    { url: csUrl, changeFrequency, priority, alternates },
    { url: enUrl, changeFrequency, priority, alternates },
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    ...localizedPair('/', 'daily', 1),
    ...localizedPair('/akce', 'daily', 0.9),
    ...localizedPair('/kavarny', 'weekly', 0.8),
    ...localizedPair('/cukrarny', 'weekly', 0.8),
    ...localizedPair('/lokality', 'weekly', 0.8),
    ...localizedPair('/kuchyne', 'weekly', 0.8),
    ...localizedPair('/pobliz', 'always', 0.7),
    ...localizedPair('/trendy', 'weekly', 0.8),
  ]
}
