// app/bouquet/[id]/page.tsx
import { getBouquetById } from "@/lib/bouquet-repository";
import { notFound } from "next/navigation";
import Bouquet from "../../../components/bouquet/Bouquet";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { giftUrl } from "@/lib/gift-sharing";
import { shareIdSchema } from "@/lib/bouquet-validation";
import Link from "next/link";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "A bouquet for you",
    robots: { index: false, follow: false },
    openGraph: {
      title: "A little love, just for you",
      description: "Someone sent you flowers. Open your bouquet.",
      ...(process.env.APP_ORIGIN && shareIdSchema.safeParse(id).success ? { images: [{ url: `${giftUrl(id, process.env.APP_ORIGIN)}/opengraph-image`, width: 1200, height: 630, alt: "A Love Garden bouquet" }] } : {}),
    },
  };
}

export default async function BouquetPage(props: Params) {
  const params = await props.params;
  const { id } = params;

  const data = await getBouquetById(id);
  if (!data) notFound();

  return (
    <main id="main-content" className="gift-page text-center p-6">
      <h1 className="stage-title">Just for you.</h1>
      <Bouquet bouquet={data} />
      <Button asChild size="lg" variant="outline" className="gift-return-action"><Link href="/bouquet?mode=color"><span aria-hidden="true">🌸</span> Send flowers back</Link></Button>
    </main>
  );
}
