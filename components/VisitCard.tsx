"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Visit } from "@/lib/types";
import { getProxiedImageUrl } from "@/lib/api-config";
import { getRatingMedal } from "@/lib/rating";

interface VisitCardProps {
  visit: Visit;
}

function getPriceInfo(price: number) {
  if (price === 0) return { label: "Cena neuvedena", color: "bg-gray-800/40 text-gray-300 border-gray-600/40" };
  if (price < 500) return { label: "Do 500 Kč", color: "bg-emerald-900/40 text-emerald-300 border-emerald-600/40" };
  if (price < 1000) return { label: "500-1000 Kč", color: "bg-blue-900/40 text-blue-300 border-blue-600/40" };
  if (price < 2000) return { label: "1000-2000 Kč", color: "bg-amber-900/40 text-amber-300 border-amber-600/40" };
  return { label: "2000+ Kč", color: "bg-rose-900/40 text-rose-300 border-rose-600/40" };
}

export default function VisitCard({ visit }: VisitCardProps) {
  const [imageError, setImageError] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const place = visit.restaurant || visit.cafe;

  const isRestaurant = !!visit.restaurant;
  // Prefer an actual photo from this visit over the place's generic photo
  const visitPhotos = visit.images || [];
  const heroImageUrl = place ? (visitPhotos.length > 0 ? visitPhotos[0] : getProxiedImageUrl(place.image_url, place.name)) : null;
  const extraPhotos = visitPhotos.slice(1);

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((i) => (i === null ? null : (i - 1 + visitPhotos.length) % visitPhotos.length));
  };
  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((i) => (i === null ? null : (i + 1) % visitPhotos.length));
  };
  const closeLightbox = () => setLightboxIndex(null);
  const openLightbox = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxIndex(index);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i === null ? null : (i - 1 + visitPhotos.length) % visitPhotos.length));
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? null : (i + 1) % visitPhotos.length));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex, visitPhotos.length]);

  if (!place) return null;

  const visitDate = new Date(visit.visit_date).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const placeMedal = getRatingMedal(visit.placeRating);

  const CardContent = () => (
    <>
      {/* Image */}
      <div className="relative h-48 -m-6 mb-4 overflow-hidden rounded-t-lg">
        {heroImageUrl && !imageError ? (
          <div
            role={visitPhotos.length > 0 ? "button" : undefined}
            tabIndex={visitPhotos.length > 0 ? 0 : undefined}
            onClick={visitPhotos.length > 0 ? openLightbox(0) : undefined}
            className={`w-full h-full ${visitPhotos.length > 0 ? "cursor-zoom-in" : ""}`}
          >
            <img
              src={heroImageUrl}
              alt={place.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-gray-900/40 flex items-center justify-center">
            <span className="text-6xl opacity-20">{isRestaurant ? "🍽️" : "☕"}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-gray-200">
          📅 {visitDate}
        </div>
        {visit.overall_rating != null && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-gray-200 font-semibold">
            ⭐ {visit.overall_rating}/10
          </div>
        )}
      </div>

      {/* Extra photos from this visit, beyond the hero image */}
      {extraPhotos.length > 0 && (
        <div className="flex gap-1.5 mb-3 -mt-1">
          {extraPhotos.slice(0, 4).map((url, i) => (
            <div
              key={url}
              role="button"
              tabIndex={0}
              onClick={openLightbox(i + 1)}
              className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 cursor-zoom-in"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 3 && extraPhotos.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
                  +{extraPhotos.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Name + location */}
      <h3 className="text-xl font-bold text-purple-300 mb-1 tracking-wide group-hover:text-purple-200 transition-colors">
        {place.name}
      </h3>
      <p className="text-sm text-gray-400 mb-3">📍 {place.location}</p>

      {/* Short overall comment */}
      {visit.comment && (
        <p className="text-sm text-gray-300 italic mb-3 leading-relaxed">&quot;{visit.comment}&quot;</p>
      )}

      {/* Dishes with optional per-dish rating */}
      {visit.dishes && visit.dishes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {visit.dishes.map((dish, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-full border border-purple-700/30"
            >
              {dish.name}
              {dish.rating ? <span className="text-purple-400 font-semibold"> {dish.rating}/10</span> : null}
            </span>
          ))}
        </div>
      )}

      {/* Long-term rating of the place (medal, or ban sign if it's bad) + price for restaurants */}
      {(visit.placeRating != null || isRestaurant) && (
        <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between gap-3">
          <span className="text-sm text-gray-300 flex items-center gap-1.5" title={placeMedal?.label}>
            {placeMedal ? (
              <>
                <span className="text-base leading-none">{placeMedal.emoji}</span> {placeMedal.label}
              </>
            ) : visit.placeRating != null ? (
              <>★ {visit.placeRating.toFixed(1).replace(/\.0$/, "")}/10</>
            ) : (
              <span className="text-gray-500">Zatím bez hodnocení</span>
            )}
          </span>
          {isRestaurant && visit.restaurant && (
            <span
              className={`px-2.5 py-1 rounded text-xs font-semibold border ${getPriceInfo(visit.restaurant.price).color}`}
            >
              {getPriceInfo(visit.restaurant.price).label}
            </span>
          )}
        </div>
      )}
    </>
  );

  const cardClasses =
    "group bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-xl shadow-purple-900/10 hover:shadow-purple-600/20 transition-all duration-500 p-6 border border-purple-600/20 hover:border-purple-500/40 relative overflow-hidden h-full";

  const card = place.website_url ? (
    <a href={place.website_url} target="_blank" rel="noopener noreferrer" className={`block ${cardClasses}`}>
      <CardContent />
    </a>
  ) : (
    <div className={cardClasses}>
      <CardContent />
    </div>
  );

  return (
    <>
      {card}
      {lightboxIndex !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Zavřít"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl backdrop-blur-sm"
            >
              ×
            </button>

            {visitPhotos.length > 1 && (
              <button
                type="button"
                onClick={showPrev}
                aria-label="Předchozí fotka"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl backdrop-blur-sm"
              >
                ‹
              </button>
            )}

            <img
              src={visitPhotos[lightboxIndex]}
              alt={place.name}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {visitPhotos.length > 1 && (
              <button
                type="button"
                onClick={showNext}
                aria-label="Další fotka"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl backdrop-blur-sm"
              >
                ›
              </button>
            )}

            {visitPhotos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                {lightboxIndex + 1} / {visitPhotos.length}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
