"use client";

import { useState } from "react";
import { Restaurant } from "@/lib/types";
import RestaurantCard from "./RestaurantCard";

interface AISearchResult {
  restaurants: Restaurant[];
  explanation: string;
}

export default function AIRestaurantSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AISearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nepodařilo se vyhledat restaurace");
      }

      setResult(data);
      setIsExpanded(true);
    } catch (err) {
      console.error("AI search error:", err);
      setError(err instanceof Error ? err.message : "Něco se pokazilo");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResult(null);
    setError(null);
    setIsExpanded(false);
  };

  return (
    <div className="mb-8">
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/50 rounded-xl hover:border-purple-400/70 transition-all mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">AI Asistent</span>
              <span className="px-2 py-0.5 bg-purple-600/40 border border-purple-400/50 rounded-full text-xs text-purple-300 font-semibold">NOVÉ</span>
            </h3>
            <p className="text-sm text-gray-400">Inteligentní vyhledávání restaurací</p>
          </div>
        </div>
        <svg
          className={`w-6 h-6 text-purple-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6 animate-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Např. "chci na řízek na Andělu" nebo "vegan restaurace v centru do 500 Kč"'
                className="w-full px-4 py-3 pr-24 bg-black border border-purple-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    Vymazat
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-md transition-colors font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Hledám...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Hledat</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Example queries */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Zkuste například:</span>
              {[
                "nejlepší pizza na Vinohradech",
                "vietnamská restaurace na Andělu",
                "degustační menu do 2000 Kč",
                "kde dají skvělý tatarák"
              ].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setQuery(example)}
                  className="text-xs px-2 py-1 bg-purple-900/30 border border-purple-500/30 rounded-full text-purple-300 hover:bg-purple-900/50 hover:border-purple-400/50 transition-all"
                  disabled={loading}
                >
                  {example}
                </button>
              ))}
            </div>
          </form>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div>
              {/* AI Explanation */}
              <div className="mb-6 p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/40 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">AI doporučuje:</h4>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{result.explanation}</p>
                  </div>
                </div>
              </div>

              {/* Restaurant results */}
              {result.restaurants.length > 0 ? (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Nalezeno {result.restaurants.length} {result.restaurants.length === 1 ? "restaurace" : result.restaurants.length < 5 ? "restaurace" : "restaurací"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.restaurants.map((restaurant) => (
                      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Bohužel jsem nenašel žádné vhodné restaurace.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
