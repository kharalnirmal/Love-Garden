import { notFound } from "next/navigation";
import GiftReveal from "@/components/bouquet/GiftReveal";
import { getBouquetById } from "@/lib/bouquet-repository";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "A bouquet for you",
  robots: { index: false, follow: false },
  openGraph: { title: "A little love, just for you", description: "Someone sent you flowers. Open your bouquet." },
};

export default async function GiftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bouquet = await getBouquetById(id);
  if (!bouquet) notFound();

  return (
    <main id="main-content" className="recipient-page text-center">
      <GiftReveal bouquet={bouquet} />
    </main>
  );
}
