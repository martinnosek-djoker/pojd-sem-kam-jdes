"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function FloatingNearbyButton() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = getDictionary(locale).common;

  useEffect(() => {
    const handleScroll = () => {
      // Show compact version after scrolling 100px
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    router.push(locale === "en" ? "/en/pobliz" : "/pobliz");
  };

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-20 right-4 z-40
        bg-terracotta hover:bg-terracotta-dark
        text-white font-semibold
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        flex items-center
        ${isScrolled ? "rounded-full p-4 justify-center" : "rounded-full px-5 py-3 gap-2"}
      `}
      aria-label={t.nearMe}
    >
      <MapPin className="w-6 h-6 flex-shrink-0" />
      <span
        className={`
          whitespace-nowrap overflow-hidden transition-all duration-300
          ${isScrolled ? "w-0 opacity-0" : "w-auto opacity-100"}
        `}
      >
        {t.nearMe}
      </span>
    </button>
  );
}
