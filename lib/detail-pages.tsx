import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getAllCafes, getAllRestaurants, getCafeById, getRestaurantById, getVisitById, getVisitsForPlace } from "@/lib/db";
import { similarCafes, similarRestaurants } from "@/lib/similar";
import type { Cafe, Restaurant } from "@/lib/types";
import type { Locale } from "@/lib/i18n/LocaleContext";
import { getDictionary, formatLongDate, translateCuisineType } from "@/lib/i18n/dictionaries";
import { parseTrailingId, placePath, visitPath, type PlaceKind } from "@/lib/slug";
import PlaceDetail, { PlaceDetailBody } from "@/components/detail/PlaceDetail";
import VisitDetail, { VisitDetailBody } from "@/components/detail/VisitDetail";
import DetailModal from "@/components/detail/DetailModal";


const SITE = "https://www.pojdsemkamjdes.cz";

const loadPlace = cache(async (kind: PlaceKind, id: number): Promise<Restaurant | Cafe | null> =>
  kind === "restaurant" ? getRestaurantById(id) : getCafeById(id)
);
const loadPlaceVisits = cache(getVisitsForPlace);
const loadVisit = cache(getVisitById);
const loadAllRestaurants = cache(getAllRestaurants);
const loadAllCafes = cache(getAllCafes);

async function loadSimilar(kind: PlaceKind, place: Restaurant | Cafe): Promise<(Restaurant | Cafe)[]> {
  return kind === "restaurant"
    ? similarRestaurants(place as Restaurant, await loadAllRestaurants())
    : similarCafes(place as Cafe, await loadAllCafes());
}

function snippet(text: string | null | undefined, max = 130): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function alternatesFor(csPath: string, locale: Locale) {
  return {
    canonical: locale === "en" ? `/en${csPath}` : csPath,
    languages: { cs: csPath, en: `/en${csPath}` },
  };
}

function enforceCanonical(canonical: string, requested: string) {
  if (requested !== canonical) permanentRedirect(canonical);
}

async function resolvePlace(kind: PlaceKind, slug: string) {
  const id = parseTrailingId(slug);
  if (id == null) return null;
  const place = await loadPlace(kind, id);
  return place ? { id, place } : null;
}

export async function placeMetadata(kind: PlaceKind, slug: string, locale: Locale): Promise<Metadata> {
  const found = await resolvePlace(kind, slug);
  // Thrown here (not only in the page) so crawlers get a real 404 / 308 status:
  // by the time the page body runs, the loading boundary has already sent a 200.
  if (!found) notFound();

  const { place } = found;
  enforceCanonical(placePath(kind, place.name, place.id, locale), `${locale === "en" ? "/en" : ""}${kind === "restaurant" ? "/restaurace" : "/kavarny"}/${slug}`);
  const dict = getDictionary(locale);
  const t = dict.detail;
  const visits = await loadPlaceVisits(kind, place.id);
  const rating = kind === "restaurant" ? (place as Restaurant).rating : (place as Cafe).rating;
  const typeWord =
    kind === "restaurant"
      ? `${translateCuisineType((place as Restaurant).cuisine_type, locale)} ${t.restaurantWord.toLowerCase()}`
      : t.cafeWord.toLowerCase();
  const latestComment = visits
    .map((v) => (locale === "en" ? v.comment_en || v.comment : v.comment))
    .find(Boolean);

  const title = `${place.name} – ${typeWord}, ${place.location}`;
  const description = [
    `${place.name}: ${typeWord} ${t.inPrague} (${place.location}).`,
    rating != null ? `${t.ratingLabel} ${rating}/10.` : "",
    place.specialty ? `${kind === "restaurant" ? t.specialty : t.whatToOrder}: ${place.specialty}.` : "",
    snippet(latestComment),
  ]
    .filter(Boolean)
    .join(" ");

  const csPath = placePath(kind, place.name, place.id, "cs");
  const image = visits.flatMap((v) => v.images || [])[0] || place.image_url || undefined;

  return {
    title: { absolute: `${title} | Pojď sem! Kam jdeš?` },
    description,
    keywords: [place.name, `${place.name} Praha`, `${typeWord} ${place.location}`],
    alternates: alternatesFor(csPath, locale),
    openGraph: {
      title,
      description,
      url: `${SITE}${placePath(kind, place.name, place.id, locale)}`,
      type: "website",
      locale: locale === "en" ? "en_US" : "cs_CZ",
      ...(image && { images: [image] }),
    },
    twitter: { card: "summary_large_image", title, description, ...(image && { images: [image] }) },
  };
}

export async function PlacePage({ kind, slug, locale }: { kind: PlaceKind; slug: string; locale: Locale }) {
  const found = await resolvePlace(kind, slug);
  if (!found) notFound();

  const { place } = found;
  const canonical = placePath(kind, place.name, place.id, locale);
  const requested = `${locale === "en" ? "/en" : ""}${kind === "restaurant" ? "/restaurace" : "/kavarny"}/${slug}`;
  if (requested !== canonical) permanentRedirect(canonical);

  const [visits, similar] = await Promise.all([loadPlaceVisits(kind, place.id), loadSimilar(kind, place)]);
  return <PlaceDetail kind={kind} place={place} visits={visits} similar={similar} locale={locale} />;
}

// Same content as PlacePage, but as a dialog over whatever page the card was clicked on.
export async function PlaceModal({ kind, slug, locale }: { kind: PlaceKind; slug: string; locale: Locale }) {
  const found = await resolvePlace(kind, slug);
  if (!found) notFound();

  const { place } = found;
  const [visits, similar] = await Promise.all([loadPlaceVisits(kind, place.id), loadSimilar(kind, place)]);
  return (
    <DetailModal>
      <PlaceDetailBody kind={kind} place={place} visits={visits} similar={similar} locale={locale} withJsonLd={false} />
    </DetailModal>
  );
}

async function resolveVisit(slug: string) {
  const id = parseTrailingId(slug);
  if (id == null) return null;
  const visit = await loadVisit(id);
  return visit && (visit.restaurant || visit.cafe) ? visit : null;
}

export async function visitMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const visit = await resolveVisit(slug);
  if (!visit) notFound();

  const place = (visit.restaurant || visit.cafe) as Restaurant | Cafe;
  enforceCanonical(visitPath(place.name, visit.visit_date, visit.id, locale), `${locale === "en" ? "/en" : ""}/navstevy/${slug}`);
  const t = getDictionary(locale).detail;
  const date = formatLongDate(visit.visit_date, locale);
  const comment = locale === "en" ? visit.comment_en || visit.comment : visit.comment;
  const dishes = (locale === "en" ? visit.dishes_en || visit.dishes : visit.dishes) || [];

  const title = `${t.visitOf(place.name)} (${date})`;
  const description =
    [
      snippet(comment, 150),
      dishes.length ? `${t.tried}: ${dishes.map((d) => d.name).join(", ")}.` : "",
      visit.overall_rating != null ? `${t.overallRating}: ${visit.overall_rating}/10.` : "",
    ]
      .filter(Boolean)
      .join(" ") || `${place.name} – ${place.location}, ${date}.`;

  const csPath = visitPath(place.name, visit.visit_date, visit.id, "cs");
  const image = visit.images?.[0] || place.image_url || undefined;

  return {
    title: { absolute: `${title} | Pojď sem! Kam jdeš?` },
    description,
    keywords: [place.name, `${place.name} Praha`, locale === "en" ? "restaurant review" : "recenze restaurace"],
    alternates: alternatesFor(csPath, locale),
    openGraph: {
      title,
      description,
      url: `${SITE}${visitPath(place.name, visit.visit_date, visit.id, locale)}`,
      type: "article",
      locale: locale === "en" ? "en_US" : "cs_CZ",
      ...(image && { images: [image] }),
    },
    twitter: { card: "summary_large_image", title, description, ...(image && { images: [image] }) },
  };
}

export async function VisitPage({ slug, locale }: { slug: string; locale: Locale }) {
  const visit = await resolveVisit(slug);
  if (!visit) notFound();

  const place = (visit.restaurant || visit.cafe) as Restaurant | Cafe;
  const kind: PlaceKind = visit.restaurant ? "restaurant" : "cafe";
  const canonical = visitPath(place.name, visit.visit_date, visit.id, locale);
  const requested = `${locale === "en" ? "/en" : ""}/navstevy/${slug}`;
  if (requested !== canonical) permanentRedirect(canonical);

  const siblings = (await loadPlaceVisits(kind, place.id)).filter((v) => v.id !== visit.id);
  return <VisitDetail visit={visit} otherVisits={siblings} locale={locale} />;
}

export async function VisitModal({ slug, locale }: { slug: string; locale: Locale }) {
  const visit = await resolveVisit(slug);
  if (!visit) notFound();

  const place = (visit.restaurant || visit.cafe) as Restaurant | Cafe;
  const kind: PlaceKind = visit.restaurant ? "restaurant" : "cafe";
  const siblings = (await loadPlaceVisits(kind, place.id)).filter((v) => v.id !== visit.id);
  return (
    <DetailModal>
      <VisitDetailBody visit={visit} otherVisits={siblings} locale={locale} withJsonLd={false} />
    </DetailModal>
  );
}
