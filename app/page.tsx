import HomePage from '@/components/HomePage';

export const metadata = {
  title: "Nejlepší restaurace, kavárny a cukrárny v Praze",
  description: "Objevte nejlepší gastro místa v Praze s osobními doporučeními od @Peču si život. Filtrujte podle lokality, typu kuchyně nebo najděte podniky ve vašem okolí. Restaurace, prémiové kavárny a skvělé cukrárny na jednom místě.",
  openGraph: {
    title: "Nejlepší restaurace, kavárny a cukrárny v Praze | Osobní doporučení",
    description: "Objevte nejlepší gastro místa v Praze. Filtrujte podle lokality, typu kuchyně nebo najděte podniky ve vašem okolí. Doporučení od @Peču si život.",
  },
};

export default function Home() {
  return <HomePage />;
}
