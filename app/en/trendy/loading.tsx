import Logo from "@/components/Logo";

export default function Loading() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-12">
          <Logo />
        </div>
        <div className="space-y-4 max-w-3xl mx-auto">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-surface-2 rounded-lg p-4 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
