export default function Logo() {
  return (
    <div className="flex items-center gap-2 md:gap-3 justify-center">
      <img
        src="/images/logo-mark.png"
        alt=""
        className="w-10 h-auto md:w-14"
      />

      <h1 className="text-base sm:text-lg md:text-2xl font-serif font-semibold text-ink tracking-wide leading-tight">
        Pojď sem! Kam jdeš?
      </h1>
    </div>
  );
}
