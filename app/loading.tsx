import Logo from "@/components/Logo";

export default function Loading() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block mb-4 sm:mb-6">
            <Logo />
          </div>
          <div className="h-6 sm:h-10 md:h-12 bg-surface-2 rounded-lg max-w-2xl mx-auto mb-3 sm:mb-4 animate-pulse" />
          <div className="h-4 sm:h-6 bg-surface-2 rounded-lg max-w-md mx-auto animate-pulse" />
        </div>

        {/* Restaurant Section Skeleton */}
        <div className="mb-6 md:mb-8">
          <div className="h-8 bg-surface-2 rounded-lg max-w-md mb-2 animate-pulse" />
          <div className="h-5 bg-surface-2 rounded-lg max-w-lg animate-pulse" />
        </div>

        {/* Filters Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="h-12 bg-surface-2 rounded-md animate-pulse" />
          <div className="h-12 bg-surface-2 rounded-md animate-pulse" />
        </div>

        {/* Restaurant Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center p-3 bg-surface border border-hairline rounded-2xl animate-pulse">
              <div className="w-[72px] h-[72px] bg-surface-2 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-surface-2 rounded w-3/4 mb-2" />
                <div className="h-3 bg-surface-2 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
