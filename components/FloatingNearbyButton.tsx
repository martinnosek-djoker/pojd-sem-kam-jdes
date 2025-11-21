"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FloatingNearbyButton() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      // Show compact version after scrolling 100px
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    router.push("/pobliz");
  };

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-20 right-4 z-40
        bg-purple-600 hover:bg-purple-700
        text-white font-semibold
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        flex items-center gap-2
        ${isScrolled ? "rounded-full p-4" : "rounded-full px-5 py-3"}
      `}
      aria-label="V mém okolí"
    >
      <MapPin className="w-6 h-6 flex-shrink-0" />
      <span
        className={`
          whitespace-nowrap overflow-hidden transition-all duration-300
          ${isScrolled ? "w-0 opacity-0" : "w-auto opacity-100"}
        `}
      >
        V mém okolí
      </span>
    </button>
  );
}
