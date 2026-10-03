import { PlaceModal } from "@/lib/detail-pages";

export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { slug: string } }) {
  return <PlaceModal kind="cafe" slug={params.slug} locale="en" />;
}
