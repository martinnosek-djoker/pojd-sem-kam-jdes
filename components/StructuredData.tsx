"use client";

import { usePathname } from "next/navigation";

export default function StructuredData() {
  const pathname = usePathname();
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  const structuredData = isEnglish
    ? {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Pojď sem! Kam jdeš?",
        "url": "https://www.pojdsemkamjdes.cz/en",
        "description":
          "Personal recommendations for the best restaurants, cafes and bakeries in Prague from @Peču si život. Search by location, cuisine, or distance. Discover the TOP 10 trends and great breakfast spots.",
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://www.pojdsemkamjdes.cz/en?location={location_string}&cuisine={cuisine_string}",
          },
          "query-input": ["required name=location_string", "required name=cuisine_string"],
        },
        "publisher": {
          "@type": "Organization",
          "name": "Pojď sem! Kam jdeš?",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.pojdsemkamjdes.cz/logo.png",
          },
          "sameAs": ["https://www.instagram.com/pecu_si_zivot/"],
        },
        "creator": {
          "@type": "Person",
          "name": "Peču si život",
          "url": "https://www.instagram.com/pecu_si_zivot/",
        },
        "about": {
          "@type": "Thing",
          "name": "Prague food scene",
          "description":
            "A guide to the best restaurants, cafes and bakeries in Prague with personal recommendations, searchable by location, cuisine type, and distance from your location",
        },
        "keywords":
          "best restaurants Prague, best cafes Prague, best bakeries Prague, restaurant recommendations, where to get coffee, where for breakfast, specialty coffee, top 10 trends",
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Pojď sem! Kam jdeš?",
        "url": "https://www.pojdsemkamjdes.cz",
        "description":
          "Osobní doporučení nejlepších restaurací, kaváren a cukráren v Praze od @Peču si život. Vyhledávání podle lokality, typu kuchyně a vzdálenosti. Objevte TOP 10 trendů a skvělá místa na snídani.",
        "inLanguage": "cs-CZ",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://www.pojdsemkamjdes.cz/?location={location_string}&cuisine={cuisine_string}",
          },
          "query-input": ["required name=location_string", "required name=cuisine_string"],
        },
        "publisher": {
          "@type": "Organization",
          "name": "Pojď sem! Kam jdeš?",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.pojdsemkamjdes.cz/logo.png",
          },
          "sameAs": ["https://www.instagram.com/pecu_si_zivot/"],
        },
        "creator": {
          "@type": "Person",
          "name": "Peču si život",
          "url": "https://www.instagram.com/pecu_si_zivot/",
        },
        "about": {
          "@type": "Thing",
          "name": "Gastronomie v Praze",
          "description":
            "Průvodce nejlepšími restauracemi, kavárnami a cukrárnami v Praze s osobními doporučeními, vyhledáváním podle lokality, typu kuchyně a vzdálenosti od vaší polohy",
        },
        "keywords":
          "nejlepší restaurace Praha, nejlepší kavárny Praha, nejlepší cukrárny Praha, doporučení restaurace, kam na kávu, kam na snídani, specialty coffee, top 10 trendů",
      };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
