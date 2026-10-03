import { MetadataRoute } from 'next'
import { getAllRestaurants, getAllCafes, getAllVisits } from '@/lib/db'
import { placePath, visitPath } from '@/lib/slug'

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

// Rebuilt per request so new places/visits show up without a redeploy.
// (force-dynamic can't be used by the static-export mobile build, which has no use for it anyway)
export const dynamic = process.env.MOBILE_BUILD === 'true' ? 'auto' : 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [restaurants, cafes, visits] = await Promise.all([getAllRestaurants(), getAllCafes(), getAllVisits()])

  const detailPages = [
    ...restaurants.flatMap((r) => localizedPair(placePath('restaurant', r.name, r.id), 'weekly', 0.7)),
    ...cafes.flatMap((c) => localizedPair(placePath('cafe', c.name, c.id), 'weekly', 0.7)),
    ...visits
      .filter((v) => v.restaurant || v.cafe)
      .flatMap((v) => localizedPair(visitPath((v.restaurant || v.cafe)!.name, v.visit_date, v.id), 'monthly', 0.6)),
  ]

  return [
    ...localizedPair('/', 'daily', 1),
    ...localizedPair('/akce', 'daily', 0.9),
    ...localizedPair('/kavarny', 'weekly', 0.8),
    ...localizedPair('/cukrarny', 'weekly', 0.8),
    ...localizedPair('/lokality', 'weekly', 0.8),
    ...localizedPair('/kuchyne', 'weekly', 0.8),
    ...localizedPair('/pobliz', 'always', 0.7),
    ...localizedPair('/trendy', 'weekly', 0.8),
    ...detailPages,
  ]
}
