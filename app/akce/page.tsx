import Logo from "@/components/Logo";

export default async function EventsPage() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-6 mb-4">
            <Logo />
          </div>
        </div>

        <div className="text-center py-20">
          <h1 className="text-4xl font-bold text-purple-400 mb-6">
            Gastro akce
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Brzy zde najdete ty nejlepší gastro akce v Praze!
          </p>
          <p className="text-gray-400">
            Pracujeme na tom, abychom vám přinesli přehled zajímavých akcí.
          </p>
        </div>
      </div>
    </main>
  );
}
