import Logo from "@/components/Logo";

export default function CafesPage() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-6 mb-4">
            <Logo />
          </div>
          <h1 className="text-4xl font-bold text-purple-400 mt-6 mb-2">Kavárny</h1>
          <p className="text-lg text-gray-300">
            Nejlepší kavárny v Praze
          </p>
        </div>

        {/* Coming Soon Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-xl border-2 border-purple-500/30 p-12 text-center shadow-2xl">
            <div className="text-6xl mb-6">☕</div>
            <h2 className="text-3xl font-bold text-purple-400 mb-4">Brzy...</h2>
            <p className="text-lg text-gray-300 mb-6">
              Připravujeme pro vás přehled těch nejlepších kaváren v Praze
            </p>
            <div className="space-y-4 text-left bg-black/30 rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-purple-300 text-center mb-4">Co můžete očekávat</h3>
              <div className="flex items-start gap-3">
                <span className="text-2xl">☕</span>
                <div>
                  <p className="text-purple-300 font-medium">Specialitní kávy</p>
                  <p className="text-sm text-gray-400">Kavárny s nejlepší kávou ve městě</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🍰</span>
                <div>
                  <p className="text-purple-300 font-medium">Domácí dezerty</p>
                  <p className="text-sm text-gray-400">Místa s vlastní cukrárnou a čerstvými zákusky</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="text-purple-300 font-medium">Knihovny a coworking</p>
                  <p className="text-sm text-gray-400">Kavárny, kde můžete pracovat nebo si číst</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌿</span>
                <div>
                  <p className="text-purple-300 font-medium">Příjemná atmosféra</p>
                  <p className="text-sm text-gray-400">Nejhezčí a nejútulnější kavárny</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-purple-500/30">
              <p className="text-sm text-gray-400">
                Sledujte náš Instagram pro novinky
              </p>
              <a
                href="https://www.instagram.com/pecu_si_zivot/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-6 py-3 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-all duration-300 border border-purple-500/50"
              >
                <span className="text-xl">📸</span>
                <span className="font-medium">@Peču si život</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
