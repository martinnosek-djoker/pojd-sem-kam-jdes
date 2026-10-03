import type { Metadata } from "next";
import { PlacePage, placeMetadata } from "@/lib/detail-pages";

export const dynamic = process.env.MOBILE_BUILD === "true" ? "auto" : "force-dynamic";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return placeMetadata("cafe", params.slug, "en");
}

export default function Page({ params }: Props) {
  return <PlacePage kind="cafe" slug={params.slug} locale="en" />;
}
