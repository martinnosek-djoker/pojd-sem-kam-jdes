"use client";

import { useEffect, useRef, useState } from "react";
import { suggestAddresses, type AddressSuggestion } from "@/lib/address-suggest";

const DEBOUNCE_MS = 350;
const MIN_CHARS = 3;

interface AddressSuggestInputProps {
  value: string;
  onChange: (value: string) => void;
  // A suggestion was chosen: its coordinates are already known, so no further geocoding is needed
  onSelect: (suggestion: AddressSuggestion) => void;
  // Enter pressed without picking a suggestion
  onSubmit: () => void;
  placeholder?: string;
}

export default function AddressSuggestInput({ value, onChange, onSelect, onSubmit, placeholder }: AddressSuggestInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  // Choosing a suggestion rewrites the input; that change must not trigger a new lookup
  const skipLookup = useRef(false);

  useEffect(() => {
    if (skipLookup.current) {
      skipLookup.current = false;
      return;
    }
    const query = value.trim();
    if (query.length < MIN_CHARS) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      suggestAddresses(query, controller.signal)
        .then((found) => {
          setSuggestions(found);
          setActive(-1);
          setOpen(found.length > 0);
        })
        .catch(() => {}); // aborted or offline: the normal Search button still works
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  const choose = (suggestion: AddressSuggestion) => {
    skipLookup.current = true;
    onChange(suggestion.label);
    setSuggestions([]);
    setOpen(false);
    onSelect(suggestion);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (open && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Enter" && active >= 0) {
        e.preventDefault();
        choose(suggestions[active]);
        return;
      }
    }
    if (e.key === "Enter") {
      setOpen(false);
      onSubmit();
    }
  };

  return (
    <div className="relative flex-1 min-w-0">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-hairline rounded-lg bg-surface text-ink placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
      />
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-[1100] left-0 right-0 mt-1 bg-surface border border-hairline rounded-lg shadow-lg overflow-hidden text-left"
        >
          {suggestions.map((s, i) => (
            <li key={`${s.label}|${s.secondary}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                // mousedown instead of click: the input's blur would otherwise close the list first
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(s);
                }}
                onMouseEnter={() => setActive(i)}
                className={`w-full px-4 py-2.5 text-left flex flex-col ${i === active ? "bg-terracotta/10" : "hover:bg-surface-2"}`}
              >
                <span className="text-ink font-medium truncate">{s.label}</span>
                {s.secondary && <span className="text-xs text-text-muted truncate">{s.secondary}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
