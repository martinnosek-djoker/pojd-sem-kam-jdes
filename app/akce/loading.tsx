import Logo from "@/components/Logo";
import LoadingPot from "@/components/LoadingPot";

export default function Loading() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-hairline pb-3 sm:pb-4 md:pb-6 mb-3 sm:mb-4">
            <Logo />
          </div>
        </div>
        <LoadingPot />
      </div>
    </main>
  );
}
