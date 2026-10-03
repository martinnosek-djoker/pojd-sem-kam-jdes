import type { Cafe, Restaurant } from "@/lib/types";
import { LocaleProvider, type Locale } from "@/lib/i18n/LocaleContext";
import RestaurantCard from "@/components/RestaurantCard";
import CafeCard from "@/components/CafeCard";

interface SimilarPlacesProps {
  kind: "restaurant" | "cafe";
  places: (Restaurant | Cafe)[];
  title: string;
  subtitle: string;
  locale: Locale;
}

export default function SimilarPlaces({ kind, places, title, subtitle, locale }: SimilarPlacesProps) {
  if (places.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="similar">
      <h2 id="similar" className="font-serif text-2xl font-semibold text-ink mb-1">{title}</h2>
      <p className="text-sm text-text-muted mb-4">{subtitle}</p>
      <LocaleProvider locale={locale}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {places.map((p) =>
            kind === "restaurant" ? (
              <RestaurantCard key={p.id} restaurant={p as Restaurant} />
            ) : (
              <CafeCard key={p.id} cafe={p as Cafe} />
            )
          )}
        </div>
      </LocaleProvider>
    </section>
  );
}
