import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center px-8">
        <h1 className="text-6xl font-serif font-bold text-ink mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text-muted mb-6">
          Stránka nenalezena
        </h2>
        <p className="text-text-muted mb-8">
          Omlouváme se, ale tato stránka neexistuje.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-terracotta text-white rounded-md hover:bg-terracotta-dark transition-all duration-300 border border-terracotta-dark shadow-lg shadow-black/5"
        >
          Zpět na domovskou stránku
        </Link>
      </div>
    </main>
  );
}
