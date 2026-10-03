import { isInstagram } from "@/lib/place-geo";

interface OpenWebButtonProps {
  url: string;
  webLabel: string;
  instagramLabel: string;
}

export default function OpenWebButton({ url, webLabel, instagramLabel }: OpenWebButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-terracotta text-white rounded-xl font-semibold shadow-lg shadow-terracotta/30 hover:bg-terracotta-dark active:scale-[0.98] transition-all"
    >
      {isInstagram(url) ? instagramLabel : webLabel}
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
