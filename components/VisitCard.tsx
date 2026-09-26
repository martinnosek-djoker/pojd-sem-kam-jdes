"use client";

import { useState } from "react";
import { Visit } from "@/lib/types";
import { getProxiedImageUrl } from "@/lib/api-config";

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
  const place = visit.restaurant || visit.cafe;

  if (!place) return null;

  const isRestaurant = !!visit.restaurant;
  const proxiedImageUrl = getProxiedImageUrl(place.image_url, place.name);
  const visitDate = new Date(visit.visit_date).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const CardContent = () => (
    <>
      {/* Image */}
      <div className="relative h-48 -m-6 mb-4 overflow-hidden rounded-t-lg">
        {proxiedImageUrl && !imageError ? (
          <img
            src={proxiedImageUrl}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-gray-900/40 flex items-center justify-center">
            <span className="text-6xl opacity-20">{isRestaurant ? "🍽️" : "☕"}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent" />
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-gray-200">
          📅 {visitDate}
        </div>
      </div>

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

      {/* Price + rating - restaurants only, cafes don't track these */}
      {isRestaurant && visit.restaurant && (
        <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between gap-3">
          <span className="text-sm text-gray-400">★ {visit.restaurant.rating}/10</span>
          <span
            className={`px-2.5 py-1 rounded text-xs font-semibold border ${getPriceInfo(visit.restaurant.price).color}`}
          >
            {getPriceInfo(visit.restaurant.price).label}
          </span>
        </div>
      )}
    </>
  );

  const cardClasses =
    "group bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-xl shadow-purple-900/10 hover:shadow-purple-600/20 transition-all duration-500 p-6 border border-purple-600/20 hover:border-purple-500/40 relative overflow-hidden h-full";

  if (place.website_url) {
    return (
      <a href={place.website_url} target="_blank" rel="noopener noreferrer" className={`block ${cardClasses}`}>
        <CardContent />
      </a>
    );
  }

  return (
    <div className={cardClasses}>
      <CardContent />
    </div>
  );
}
