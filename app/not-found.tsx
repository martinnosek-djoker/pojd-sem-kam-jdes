import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="text-center px-8">
        <h1 className="text-6xl font-bold text-purple-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-6">
          Stránka nenalezena
        </h2>
        <p className="text-gray-400 mb-8">
          Omlouváme se, ale tato stránka neexistuje.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50"
        >
          Zpět na domovskou stránku
        </Link>
      </div>
    </main>
  );
}
