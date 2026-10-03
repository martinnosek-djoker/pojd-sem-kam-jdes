import { PlaceModal } from "@/lib/detail-pages";

export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { slug: string } }) {
  return <PlaceModal kind="restaurant" slug={params.slug} locale="cs" />;
}
