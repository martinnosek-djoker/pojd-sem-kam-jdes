import type { Cafe, Restaurant, Visit } from "@/lib/types";
import type { Locale } from "@/lib/i18n/LocaleContext";
import { getDictionary, formatPrice, getPriceBadgeClasses, translateCuisineType } from "@/lib/i18n/dictionaries";
import { getPlacePoints } from "@/lib/place-geo";
import { placePath, type PlaceKind } from "@/lib/slug";
import DetailShell from "./DetailShell";
import OpenWebButton from "./OpenWebButton";
import PlaceMap from "./PlaceMap";
import PhotoGallery from "./PhotoGallery";
import HeroImage from "./HeroImage";
import VisitEntry from "./VisitEntry";
import SimilarPlaces from "./SimilarPlaces";
import JsonLd from "./JsonLd";

interface PlaceDetailProps {
  kind: PlaceKind;
  place: Restaurant | Cafe;
  visits: Visit[];
  similar: (Restaurant | Cafe)[];
  locale: Locale;
  withJsonLd?: boolean;
}

const SITE = "https://www.pojdsemkamjdes.cz";

// The page content on its own, so it can sit in a full page (PlaceDetail) or a dialog.
export function PlaceDetailBody({ kind, place, visits, similar, locale, withJsonLd = true }: PlaceDetailProps) {
  const dict = getDictionary(locale);
  const t = dict.detail;
  const isRestaurant = kind === "restaurant";
  const restaurant = isRestaurant ? (place as Restaurant) : null;
  const cafe = !isRestaurant ? (place as Cafe) : null;
  const points = getPlacePoints(place);
  const photos = visits.flatMap((v) => v.images || []);
  const tagLabels: Record<string, string> = {
    dezert: dict.kavarny.tagDezert,
    matcha: dict.kavarny.tagMatcha,
    "snídaně": dict.kavarny.tagSnidane,
    "top-kava": dict.kavarny.tagTopKava,
  };
  const rating = isRestaurant ? restaurant!.rating : cafe!.rating;
  const specialty = place.specialty;
  const path = placePath(kind, place.name, place.id, locale);
  const mainPoint = points.find((p) => p.lat != null) ?? points[0];

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": isRestaurant ? "Restaurant" : "CafeOrCoffeeShop",
    name: place.name,
    url: `${SITE}${path}`,
    inLanguage: locale === "en" ? "en-US" : "cs-CZ",
    ...(place.image_url && { image: place.image_url.startsWith("/") ? `${SITE}${place.image_url}` : place.image_url }),
    ...(place.website_url && { sameAs: [place.website_url] }),
    ...(restaurant && { servesCuisine: translateCuisineType(restaurant.cuisine_type, locale) }),
    address: {
      "@type": "PostalAddress",
      ...(mainPoint?.address && { streetAddress: mainPoint.address }),
      addressLocality: "Praha",
      addressCountry: "CZ",
    },
    ...(mainPoint?.lat != null && {
      geo: { "@type": "GeoCoordinates", latitude: mainPoint.lat, longitude: mainPoint.lng },
    }),
    review: visits
      .filter((v) => v.overall_rating != null)
      .map((v) => ({
        "@type": "Review",
        author: { "@type": "Person", name: "Peču si život" },
        datePublished: v.visit_date.slice(0, 10),
        reviewRating: { "@type": "Rating", ratingValue: v.overall_rating, bestRating: 10, worstRating: 1 },
        ...((locale === "en" ? v.comment_en || v.comment : v.comment) && {
          reviewBody: locale === "en" ? v.comment_en || v.comment : v.comment,
        }),
      })),
  };
  if ((jsonLd.review as unknown[]).length === 0) delete jsonLd.review;

  return (
    <>
      {withJsonLd && <JsonLd data={jsonLd} />}

      <article>
        <HeroImage
          src={place.image_url}
          alt={`${place.name} – ${isRestaurant ? dict.common.altRestaurant : dict.common.altCafe} ${place.location}`}
          fallbackEmoji={isRestaurant ? "🍽️" : "☕"}
        />

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-2">{place.name}</h1>
        <p className="text-text-muted mb-4">
          {place.location}
          {restaurant ? ` · ${translateCuisineType(restaurant.cuisine_type, locale)}` : ""}
          {specialty ? ` · ${specialty}` : ""}
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          {rating != null && (
            <span className="flex items-center gap-1 text-base font-semibold text-ink mr-1" title={t.ratingLabel}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#F2B84B" aria-hidden="true">
                <path d="M12 2.5l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.6 6.4 19.6l1.4-6.3-4.8-4.3 6.4-.6L12 2.5Z" />
              </svg>
              {rating}/10
            </span>
          )}
          {restaurant && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${getPriceBadgeClasses(restaurant.price)}`}>
              {formatPrice(restaurant.price, locale)}
            </span>
          )}
          {cafe?.tags?.map((tag) => (
            <span key={tag} className="px-2.5 py-1 text-xs font-semibold rounded-full bg-terracotta/10 text-terracotta">
              {tagLabels[tag] || tag}
            </span>
          ))}
        </div>

        {specialty && (
          <p className="mb-5 p-4 bg-surface-tint border border-terracotta/20 rounded-xl text-ink">
            <span className="font-semibold">{isRestaurant ? t.specialty : t.whatToOrder}:</span> {specialty}
          </p>
        )}

        {place.website_url && (
          <div className="mb-8">
            <OpenWebButton url={place.website_url} webLabel={t.openWeb} instagramLabel={t.openInstagram} />
          </div>
        )}
      </article>

      <section className="mb-10" aria-labelledby="where">
        <h2 id="where" className="font-serif text-2xl font-semibold text-ink mb-4">{t.whereTitle}</h2>
        <PlaceMap points={points} navigateLabel={t.navigate} largerMapLabel={t.largerMap} mapWord={t.mapWord} />
      </section>

      {/* With a single visit its photos already show in that visit below. */}
      {visits.length > 1 && photos.length > 0 && (
        <section className="mb-10" aria-labelledby="gallery">
          <h2 id="gallery" className="font-serif text-2xl font-semibold text-ink mb-4">{t.galleryTitle}</h2>
          <PhotoGallery photos={photos} altBase={place.name} photoWord={t.photoWord} />
        </section>
      )}

      <section aria-labelledby="visits">
        <h2 id="visits" className="font-serif text-2xl font-semibold text-ink mb-4">{t.myVisits}</h2>
        {visits.length === 0 ? (
          <p className="text-text-muted">{t.noVisits}</p>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <VisitEntry key={visit.id} visit={visit} locale={locale} placeName={place.name} />
            ))}
          </div>
        )}
      </section>

      <SimilarPlaces
        kind={kind}
        places={similar}
        title={isRestaurant ? t.similarTitle : t.similarCafesTitle}
        subtitle={isRestaurant ? t.similarByCuisine(translateCuisineType(restaurant!.cuisine_type, locale)) : t.similarByTags}
        locale={locale}
      />
    </>
  );
}

export default function PlaceDetail(props: PlaceDetailProps) {
  const { kind, locale } = props;
  const t = getDictionary(locale).detail;
  const isRestaurant = kind === "restaurant";

  return (
    <DetailShell
      locale={locale}
      backHref={isRestaurant ? (locale === "en" ? "/en" : "/") : locale === "en" ? "/en/kavarny" : "/kavarny"}
      backLabel={isRestaurant ? t.backRestaurants : t.backCafes}
    >
      <PlaceDetailBody {...props} />
    </DetailShell>
  );
}
