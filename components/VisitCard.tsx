"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Visit } from "@/lib/types";
import { getProxiedImageUrl } from "@/lib/api-config";

interface VisitCardProps {
  visit: Visit;
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

      {/* Name + location, with a small thumbnail of extra photos alongside -
          never anything stacked above/below that could push this around. */}
      <div className="flex items-start justify-between gap-3 mb-3 min-h-[48px]">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-purple-300 mb-1 tracking-wide group-hover:text-purple-200 transition-colors truncate">
            {place.name}
          </h3>
          <p className="text-sm text-gray-400 truncate">📍 {place.location}</p>
        </div>
        {extraPhotos.length > 0 && (
          <div
            role="button"
            tabIndex={0}
            onClick={openLightbox(1)}
            className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 cursor-zoom-in"
          >
            <img src={extraPhotos[0]} alt="" className="w-full h-full object-cover" />
            {extraPhotos.length > 1 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-semibold">
                +{extraPhotos.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Short overall comment - reserved 4-line height whether present or not */}
      <div className="mb-3 min-h-[92px]">
        {visit.comment && (
          <p className="text-sm text-gray-300 italic leading-relaxed line-clamp-4">&quot;{visit.comment}&quot;</p>
        )}
      </div>

      {/* Dishes with optional per-dish rating - capped count, reserved height */}
      <div className="h-[60px] overflow-hidden mb-4">
        {visit.dishes && visit.dishes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visit.dishes.slice(0, 3).map((dish, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-full border border-purple-700/30"
              >
                {dish.name}
                {dish.rating ? <span className="text-purple-400 font-semibold"> {dish.rating}/10</span> : null}
              </span>
            ))}
            {visit.dishes.length > 3 && (
              <span className="px-2.5 py-1 bg-purple-900/20 text-purple-400 text-xs rounded-full border border-purple-700/20">
                +{visit.dishes.length - 3} další
              </span>
            )}
          </div>
        )}
      </div>

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
