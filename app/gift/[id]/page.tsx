import { notFound } from "next/navigation";
import GiftReveal from "@/components/bouquet/GiftReveal";
import { getBouquetById } from "@/lib/bouquet-repository";
import { giftMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return giftMetadata((await params).id);
}

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
