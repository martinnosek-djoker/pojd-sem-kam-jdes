"use client";

import { useEffect, useState } from "react";
import type { Cafe, Restaurant, Visit } from "@/lib/types";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";
import { getApiUrl } from "@/lib/api-config";
import { IS_STATIC_APP, type PlaceKind } from "@/lib/slug";
import { closeAllDetails, useCurrentDetail, type DetailTarget } from "@/lib/app-detail";
import DetailModal from "./DetailModal";
import { PlaceDetailBody } from "./PlaceDetail";
import { VisitDetailBody } from "./VisitDetail";

interface PlaceExtras {
  visits: Visit[];
  similar: (Restaurant | Cafe)[];
}

const cache = new Map<string, PlaceExtras>();

// Visits + similar places for a place, from the live API (the card itself already has the place).
function usePlaceExtras(kind: PlaceKind | null, id: number | null) {
  const key = kind && id ? `${kind}:${id}` : null;
  const [extras, setExtras] = useState<PlaceExtras | null>(key ? cache.get(key) ?? null : null);

  useEffect(() => {
    if (!key) return;
    const cached = cache.get(key);
    setExtras(cached ?? null);

    let cancelled = false;
    fetch(getApiUrl(`/api/detail/place?kind=${kind}&id=${id}`))
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        const next = { visits: data.visits ?? [], similar: data.similar ?? [] };
        cache.set(key, next);
        if (!cancelled) setExtras(next);
      })
      .catch((error) => {
        // Offline / API hiccup: keep whatever the card already shows (and any earlier copy)
        console.error("[AppDetailHost] Could not load detail:", error);
        if (!cancelled && !cached) setExtras({ visits: [], similar: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [key, kind, id]);

  return extras;
}

function DetailContent({ target }: { target: DetailTarget }) {
  const kind: PlaceKind = target.type === "place" ? target.kind : target.visit.restaurant ? "restaurant" : "cafe";
  const place = target.type === "place" ? target.place : ((target.visit.restaurant || target.visit.cafe) as Restaurant | Cafe);
  const extras = usePlaceExtras(kind, place.id);

  if (target.type === "place") {
    return (
      <PlaceDetailBody
        kind={target.kind}
        place={target.place}
        visits={extras?.visits ?? []}
        similar={extras?.similar ?? []}
        locale={target.locale}
        withJsonLd={false}
        visitsLoading={extras === null}
      />
    );
  }

  return (
    <VisitDetailBody
      visit={target.visit}
      otherVisits={(extras?.visits ?? []).filter((v) => v.id !== target.visit.id)}
      locale={target.locale}
      withJsonLd={false}
      otherVisitsLoading={extras === null}
    />
  );
}

// Native-app counterpart of the web's intercepted-route dialogs (app/@modal): the same detail
// content over whatever page the card was tapped on. Mounted once in the root layout.
export default function AppDetailHost() {
  const target = useCurrentDetail();
  if (!IS_STATIC_APP || !target) return null;

  const key = target.type === "place" ? `place-${target.kind}-${target.place.id}` : `visit-${target.visit.id}`;

  return (
    <LocaleProvider locale={target.locale}>
      <DetailModal onClose={closeAllDetails} key={key}>
        <DetailContent target={target} />
      </DetailModal>
    </LocaleProvider>
  );
}

