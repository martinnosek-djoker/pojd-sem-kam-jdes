import Link from "next/link";
import type { Cafe, Restaurant, Visit } from "@/lib/types";
import type { Locale } from "@/lib/i18n/LocaleContext";
import { getDictionary, formatLongDate } from "@/lib/i18n/dictionaries";
import { getPlacePoints } from "@/lib/place-geo";
import { placePath, visitPath } from "@/lib/slug";
import DetailShell from "./DetailShell";
import OpenWebButton from "./OpenWebButton";
import PlaceMap from "./PlaceMap";
import VisitEntry from "./VisitEntry";
import HeroImage from "./HeroImage";
import JsonLd from "./JsonLd";

interface VisitDetailProps {
  visit: Visit;
  otherVisits: Visit[];
  locale: Locale;
}

const SITE = "https://www.pojdsemkamjdes.cz";

export default function VisitDetail({ visit, otherVisits, locale }: VisitDetailProps) {
  const t = getDictionary(locale).detail;
  const kind = visit.restaurant ? "restaurant" : "cafe";
  const place = (visit.restaurant || visit.cafe) as Restaurant | Cafe;
  const points = getPlacePoints(place);
  const placeHref = placePath(kind, place.name, place.id, locale);
  const comment = locale === "en" ? visit.comment_en || visit.comment : visit.comment;
  const date = formatLongDate(visit.visit_date, locale);
  const heroImage = visit.images?.[0] || place.image_url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    url: `${SITE}${visitPath(place.name, visit.visit_date, visit.id, locale)}`,
    inLanguage: locale === "en" ? "en-US" : "cs-CZ",
    author: { "@type": "Person", name: "Peču si život" },
    datePublished: visit.visit_date.slice(0, 10),
    itemReviewed: {
      "@type": kind === "restaurant" ? "Restaurant" : "CafeOrCoffeeShop",
      name: place.name,
      url: `${SITE}${placeHref}`,
      address: { "@type": "PostalAddress", addressLocality: "Praha", addressCountry: "CZ" },
    },
    ...(visit.overall_rating != null && {
      reviewRating: { "@type": "Rating", ratingValue: visit.overall_rating, bestRating: 10, worstRating: 1 },
    }),
    ...(comment && { reviewBody: comment }),
  };

  return (
    <DetailShell locale={locale} backHref={locale === "en" ? "/en" : "/"} backLabel={t.backHome}>
      <JsonLd data={jsonLd} />

      <HeroImage src={heroImage} alt={`${place.name} – ${date}`} fallbackEmoji={kind === "restaurant" ? "🍽️" : "☕"} />

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-2">{t.visitOf(place.name)}</h1>
      <p className="text-text-muted mb-5">
        {place.location} ·{" "}
        <Link href={placeHref} className="text-terracotta hover:text-terracotta-dark font-semibold transition-colors">
          {t.placeLink(place.name)}
        </Link>
      </p>

      {place.website_url && (
        <div className="mb-8">
          <OpenWebButton url={place.website_url} webLabel={t.openWeb} instagramLabel={t.openInstagram} />
        </div>
      )}

      <div className="mb-10">
        <VisitEntry visit={visit} locale={locale} placeName={place.name} showPermalink={false} headingLevel="h2" />
      </div>

      <section className="mb-10" aria-labelledby="where">
        <h2 id="where" className="font-serif text-2xl font-semibold text-ink mb-4">{t.whereTitle}</h2>
        <PlaceMap points={points} navigateLabel={t.navigate} largerMapLabel={t.largerMap} mapWord={t.mapWord} />
      </section>

      {otherVisits.length > 0 && (
        <section aria-labelledby="more">
          <h2 id="more" className="font-serif text-2xl font-semibold text-ink mb-4">{t.otherVisits}</h2>
          <div className="space-y-4">
            {otherVisits.map((v) => (
              <VisitEntry key={v.id} visit={v} locale={locale} placeName={place.name} />
            ))}
          </div>
        </section>
      )}
    </DetailShell>
  );
}
