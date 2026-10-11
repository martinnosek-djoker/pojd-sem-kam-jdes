import type { Metadata } from "next";
import DetailShell from "@/components/detail/DetailShell";
import type { Locale } from "@/lib/i18n/LocaleContext";
import { ANDROID_OPT_IN_URL, ANDROID_TESTER_GROUP_URL } from "@/lib/android-app";

const TEXT = {
  cs: {
    back: "← Domů",
    title: "Vyzkoušej naši Android appku",
    intro: "Appka je zatím v uzavřeném testování na Google Play. Stačí dva rychlé kroky a nainstaluje se ti přímo z Obchodu Play.",
    step1: "1. Přidej se do skupiny testerů",
    step1Text: "Přihlas se svým Google účtem (stejným, jaký používáš v Obchodě Play) a klepni na „Připojit se ke skupině“.",
    step1Button: "Připojit se ke skupině",
    step2: "2. Stáhni appku z Google Play",
    step2Text: "Potom otevři odkaz na svém Androidu, potvrď účast v testu a appku nainstaluj.",
    step2Button: "Stáhnout z Google Play",
    note: "Až bude appka schválená pro všechny, objeví se normálně v Obchodě Play. Děkujeme, že nám pomáháš ji vyladit!",
  },
  en: {
    back: "← Home",
    title: "Try our Android app",
    intro: "The app is in closed testing on Google Play for now. Two quick steps and it installs straight from the Play Store.",
    step1: "1. Join the testers group",
    step1Text: "Sign in with your Google account (the one you use in the Play Store) and tap “Join group”.",
    step1Button: "Join group",
    step2: "2. Get the app from Google Play",
    step2Text: "Then open the link on your Android phone, accept the test invitation and install the app.",
    step2Button: "Get it on Google Play",
    note: "Once the app is approved for everyone it will appear in the Play Store as usual. Thanks for helping us polish it!",
  },
} as const;

export const androidPageMetadata = (locale: Locale): Metadata => ({
  title: TEXT[locale].title,
  robots: { index: false, follow: true },
});

export default function AndroidAppPage({ locale }: { locale: Locale }) {
  const t = TEXT[locale];
  const buttonClasses =
    "inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-terracotta text-white shadow-lg shadow-terracotta/30 hover:bg-terracotta-dark transition-colors";

  return (
    <DetailShell locale={locale} backHref={locale === "en" ? "/en" : "/"} backLabel={t.back}>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-3">{t.title}</h1>
      <p className="text-ink-mid leading-relaxed mb-8">{t.intro}</p>

      <section className="bg-surface border border-hairline rounded-2xl p-5 sm:p-6 mb-4 shadow-md shadow-black/5">
        <h2 className="font-serif text-xl font-semibold text-ink mb-2">{t.step1}</h2>
        <p className="text-text-muted mb-4">{t.step1Text}</p>
        <a href={ANDROID_TESTER_GROUP_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses}>
          {t.step1Button}
        </a>
      </section>

      <section className="bg-surface border border-hairline rounded-2xl p-5 sm:p-6 mb-8 shadow-md shadow-black/5">
        <h2 className="font-serif text-xl font-semibold text-ink mb-2">{t.step2}</h2>
        <p className="text-text-muted mb-4">{t.step2Text}</p>
        <a href={ANDROID_OPT_IN_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses}>
          {t.step2Button}
        </a>
      </section>

      <p className="text-sm text-text-muted">{t.note}</p>
    </DetailShell>
  );
}
