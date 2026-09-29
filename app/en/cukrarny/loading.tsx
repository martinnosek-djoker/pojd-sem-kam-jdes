import Logo from "@/components/Logo";
import LoadingPot from "@/components/LoadingPot";

export default function Loading() {
  return (
    <main className="min-h-screen px-8 pb-8 bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="pt-10 md:pt-8 mb-8">
          <Logo />
        </div>
        <LoadingPot />
      </div>
    </main>
  );
}
