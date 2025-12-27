export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Pojď sem! Kam jdeš?",
    "url": "https://www.pojdsemkamjdes.cz",
    "description": "TOP 10 trendů v Praze! Kompletní databáze nejlepších restaurací, kaváren a cukráren v Praze. Vyhledávání podle lokality a typu kuchyně.",
    "inLanguage": "cs-CZ",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.pojdsemkamjdes.cz/kuchyne?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Pojď sem! Kam jdeš?",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.pojdsemkamjdes.cz/logo.png"
      }
    },
    "about": {
      "@type": "Thing",
      "name": "Restaurace a kavárny v Praze",
      "description": "Databáze nejlepších restaurací, kaváren a cukráren v Praze s vyhledáváním podle lokality a typu kuchyně"
    },
    "keywords": "restaurace Praha, kavárny Praha, cukrárny Praha, gastro akce Praha"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
