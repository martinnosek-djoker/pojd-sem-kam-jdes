import { VisitModal } from "@/lib/detail-pages";

export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { slug: string } }) {
  return <VisitModal slug={params.slug} locale="en" />;
}
