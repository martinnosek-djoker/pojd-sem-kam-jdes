"use client";

import { useEffect, useState } from "react";
import ChristmasCard from "@/components/ChristmasCard";
import Logo from "@/components/Logo";
import LoadingPot from "@/components/LoadingPot";
import { ChristmasTip, ChristmasCategory, CHRISTMAS_CATEGORY_LABELS } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";

export default function ChristmasPage() {
  const [tips, setTips] = useState<ChristmasTip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTips() {
      try {
        const response = await fetch(getApiUrl("/api/christmas-tips"));
        const data = await response.json();

        if (Array.isArray(data)) {
          setTips(data);
        }
      } catch (error) {
        console.error("Error fetching Christmas tips:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTips();
  }, []);

  // Group tips by category
  const tipsByCategory: Record<ChristmasCategory, ChristmasTip[]> = {
    'cukrovi': [],
    'vanocka': [],
    'jedle-darky': [],
    'zazitky': [],
    'veci-do-kuchyne': [],
  };

  tips.forEach(tip => {
    if (tipsByCategory[tip.category]) {
      tipsByCategory[tip.category].push(tip);
    }
  });

  // Category order and icons
  const categories: { key: ChristmasCategory; icon: string }[] = [
    { key: 'cukrovi', icon: '🍪' },
    { key: 'vanocka', icon: '🥖' },
    { key: 'jedle-darky', icon: '🎁' },
    { key: 'zazitky', icon: '✨' },
    { key: 'veci-do-kuchyne', icon: '🍳' },
  ];

  if (loading) {
    return (
      <main className="min-h-screen px-8 pb-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="pt-10 md:pt-8 mb-8">
            <Logo />
          </div>
          <LoadingPot />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-8 pb-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pt-10 md:pt-8 mb-6 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-red-500 pb-3 md:pb-6 mb-2 md:mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-red-400 mt-4 md:mt-6 mb-2">
            🎄 Vánoce 2025
          </h1>
          <p className="text-sm md:text-lg text-gray-300">
            Tipy na vánoční nákupy, dárky a zážitky
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-12">
          {categories.map(({ key, icon }) => {
            const categoryTips = tipsByCategory[key];

            if (categoryTips.length === 0) {
              return null; // Don't show empty categories
            }

            return (
              <div key={key} className="mb-8">
                {/* Category Header */}
                <div className="mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-red-300 tracking-wide flex items-center gap-2">
                    <span className="text-3xl">{icon}</span>
                    {CHRISTMAS_CATEGORY_LABELS[key]}
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-transparent mt-2 rounded-full"></div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTips.map((tip) => (
                    <ChristmasCard key={tip.id} tip={tip} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {tips.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎄</div>
            <p className="text-xl text-gray-400 mb-4">
              Připravujeme vánoční tipy pro rok 2025
            </p>
            <p className="text-sm text-gray-500">
              Brzy tu najdete skvělé tipy na vánoční nákupy!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
