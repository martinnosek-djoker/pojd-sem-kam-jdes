"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Coordinates } from "@/lib/types";

export interface NearbyMapPlace {
  key: string;
  name: string;
  kind: "restaurant" | "cafe";
  distanceLabel: string;
  coords: Coordinates;
}

interface NearbyMapProps {
  user: Coordinates;
  radiusKm: number;
  places: NearbyMapPlace[];
  youLabel: string;
  directionsLabel: string;
  mapLabel: string;
}

const PIN_SIZE = 20;

// Map of the nearby results: you, the search radius and every place in it. Leaflet is loaded
// lazily so it never touches `window` during server rendering / static export.
export default function NearbyMap({ user, radiusKm, places, youLabel, directionsLabel, mapLabel }: NearbyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function draw() {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, { zoomControl: true, attributionControl: true });
        // OSM's public tile server: fine for this traffic, but if the app grows move to a hosted
        // tile provider (OSM's usage policy forbids heavy use).
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapRef.current);
        layerRef.current = L.layerGroup().addTo(mapRef.current);
      }

      const map = mapRef.current;
      const layer = layerRef.current!;
      layer.clearLayers();

      // Give the map a view first: Leaflet can't project the circle (or fit bounds) without one
      map.setView([user.lat, user.lng], 14);

      L.circle([user.lat, user.lng], {
        radius: radiusKm * 1000,
        color: "#C1572E",
        weight: 1.5,
        fillColor: "#C1572E",
        fillOpacity: 0.06,
        interactive: false,
      }).addTo(layer);

      L.marker([user.lat, user.lng], {
        title: youLabel,
        icon: L.divIcon({
          className: "",
          iconSize: [18, 18],
          html: '<span style="display:block;width:18px;height:18px;border-radius:50%;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 2px rgba(37,99,235,.35)"></span>',
        }),
      }).addTo(layer);

      places.forEach((p) => {
        const marker = L.marker([p.coords.lat, p.coords.lng], {
          title: p.name,
          icon: L.divIcon({
            className: "",
            iconSize: [PIN_SIZE, PIN_SIZE],
            html: `<span style="display:flex;align-items:center;justify-content:center;width:${PIN_SIZE}px;height:${PIN_SIZE}px;border-radius:50%;background:#C1572E;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);font-size:10px;line-height:1">${p.kind === "cafe" ? "☕" : "🍽"}</span>`,
          }),
        }).addTo(layer);

        // Built from DOM nodes so place names are never interpreted as HTML
        const box = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = p.name;
        const dist = document.createElement("div");
        dist.textContent = p.distanceLabel;
        const link = document.createElement("a");
        link.href = `https://www.google.com/maps/dir/?api=1&destination=${p.coords.lat},${p.coords.lng}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = directionsLabel;
        link.style.color = "#C1572E";
        link.style.fontWeight = "600";
        box.append(title, dist, link);
        marker.bindPopup(box);
      });

      map.fitBounds(L.latLng(user.lat, user.lng).toBounds(radiusKm * 2000), { padding: [12, 12] });
    }

    draw();
    return () => {
      cancelled = true;
    };
  }, [user, radiusKm, places, youLabel, directionsLabel]);

  // Tear the map down only when the component goes away
  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={mapLabel}
      className="w-full h-72 md:h-96 rounded-lg border border-hairline overflow-hidden mb-6 z-0"
    />
  );
}
