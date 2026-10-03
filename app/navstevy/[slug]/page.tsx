import type { Metadata } from "next";
import { VisitPage, visitMetadata } from "@/lib/detail-pages";

export const dynamic = process.env.MOBILE_BUILD === "true" ? "auto" : "force-dynamic";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return visitMetadata(params.slug, "cs");
}

export default function Page({ params }: Props) {
  return <VisitPage slug={params.slug} locale="cs" />;
}
