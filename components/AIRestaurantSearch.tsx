"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bakery, Cafe, Restaurant } from "@/lib/types";
import RestaurantCard from "./RestaurantCard";
import CafeCard from "./CafeCard";
import BakeryCard from "./BakeryCard";
import { getApiUrl } from "@/lib/api-config";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { suggestCompletions, type SuggestionKind, type SuggestionTerm } from "@/lib/ai-suggest";

const KIND_ICON: Record<SuggestionKind, string> = {
  area: "📍",
  cuisine: "🍽️",
  dish: "🍴",
  tag: "☕",
  place: "🏠",
  keyword: "🔎",
};

// Vocabulary for the autocomplete, fetched once per language and kept for the session
const termsCache = new Map<string, SuggestionTerm[]>();

type AIPlace =
  | { type: "restaurant"; data: Restaurant }
  | { type: "cafe"; data: Cafe }
  | { type: "bakery"; data: Bakery };

interface AISearchResult {
  places: AIPlace[];
  explanation: string;
}

// AI explanation text comes back with markdown-style **bold** markers - render them as actual bold
function renderFormattedExplanation(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-ink font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

export default function AIRestaurantSearch() {
  const locale = useLocale();
  const t = getDictionary(locale).aiSearch;
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AISearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [terms, setTerms] = useState<SuggestionTerm[]>(() => termsCache.get(locale) ?? []);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load the autocomplete vocabulary the first time the panel opens; without it the example chips just stay
  useEffect(() => {
    if (!isExpanded || termsCache.has(locale)) return;
    let cancelled = false;
    fetch(getApiUrl("/api/ai-search/suggestions"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.terms?.length) return;
        termsCache.set(locale, data.terms);
        if (!cancelled) setTerms(data.terms);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isExpanded, locale]);

  const completions = useMemo(() => suggestCompletions(query, terms), [query, terms]);

  const pickCompletion = (value: string) => {
    setQuery(value);
    inputRef.current?.focus();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // The button always looks active; an empty search just puts the cursor in the field
    if (!query.trim()) {
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(getApiUrl("/api/ai-search"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim(), locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.error);
      }

      // Older servers only answer with `restaurants`
      setResult({
        places: data.places ?? (data.restaurants ?? []).map((r: Restaurant) => ({ type: "restaurant", data: r })),
        explanation: data.explanation,
      });
      setIsExpanded(true);
    } catch (err) {
      console.error("AI search error:", err);
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResult(null);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="mb-8">
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-surface border border-hairline rounded-xl hover:border-terracotta/40 transition-all mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-2 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-serif font-bold text-ink flex items-center gap-2">
              <span className="text-terracotta">{t.title}</span>
              <span className="px-2 py-0.5 bg-terracotta/10 border border-terracotta/30 rounded-full text-xs text-terracotta font-semibold">{t.badge}</span>
            </h3>
            <p className="text-sm text-text-muted">{t.subtitle}</p>
          </div>
        </div>
        <svg
          className={`w-6 h-6 text-terracotta transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="bg-surface border border-hairline rounded-xl p-4 sm:p-6 animate-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleSearch} className={result || error ? "mb-6" : ""}>
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.placeholder}
                  enterKeyHint="search"
                  autoComplete="off"
                  className="w-full px-4 py-3 pr-10 bg-bg border border-hairline rounded-lg text-ink placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  disabled={loading}
                />
                {query && !loading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    aria-label={t.clear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-text-muted hover:text-ink hover:bg-surface-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                aria-label={t.search}
                className="flex-shrink-0 whitespace-nowrap px-4 sm:px-5 py-3 bg-terracotta hover:bg-terracotta-dark text-white rounded-lg border border-terracotta-dark shadow-lg shadow-black/5 transition-colors font-semibold flex items-center gap-2 disabled:cursor-wait"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">{t.searching}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {/* icon only on phones so the placeholder gets the room */}
                    <span className="hidden sm:inline">{t.search}</span>
                  </>
                )}
              </button>
            </div>

            {/* While typing: complete the word being typed. Otherwise: example queries */}
            {query.trim() ? (
              completions.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2" aria-live="polite">
                  <span className="text-xs text-text-muted">{t.suggestions}</span>
                  {completions.map(({ term, value }) => (
                    <button
                      key={`${term.kind}-${term.text}`}
                      type="button"
                      onClick={() => pickCompletion(value)}
                      className="text-sm px-3 py-1.5 bg-surface-2 border border-hairline rounded-full text-ink-mid hover:bg-terracotta/10 hover:border-terracotta/40 transition-all"
                      disabled={loading}
                    >
                      <span aria-hidden="true" className="mr-1">{KIND_ICON[term.kind]}</span>
                      {term.text}
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-text-muted">{t.tryExample}</span>
                {t.examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => pickCompletion(example)}
                    className="text-xs px-2 py-1 bg-surface-2 border border-hairline rounded-full text-ink-mid hover:bg-terracotta/10 hover:border-terracotta/40 transition-all"
                    disabled={loading}
                  >
                    {example}
                  </button>
                ))}
              </div>
            )}
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
              <div className="mb-6 p-4 bg-surface-tint border border-terracotta/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-surface-2 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-terracotta mb-2">{t.recommends}</h4>
                    <p className="text-ink-mid text-sm leading-relaxed whitespace-pre-line">{renderFormattedExplanation(result.explanation)}</p>
                  </div>
                </div>
              </div>

              {/* Place results: restaurants, cafes and bakeries can be mixed */}
              {result.places.length > 0 ? (
                <div>
                  <h4 className="text-lg font-serif font-semibold text-ink mb-4">{t.found(result.places.length)}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.places.map((place) =>
                      place.type === "restaurant" ? (
                        <RestaurantCard key={`r${place.data.id}`} restaurant={place.data} />
                      ) : place.type === "cafe" ? (
                        <CafeCard key={`c${place.data.id}`} cafe={place.data} />
                      ) : (
                        <BakeryCard key={`b${place.data.id}`} bakery={place.data} />
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-muted">{t.nothingFound}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
