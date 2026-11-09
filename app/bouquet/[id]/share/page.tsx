import { notFound } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { getBouquetById } from "@/lib/bouquet-repository";
import Bouquet from "@/components/bouquet/Bouquet";
import GiftShareTools from "@/components/bouquet/GiftShareTools";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your bouquet is ready", robots: { index: false, follow: false } };

export default async function ShareGiftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bouquet = await getBouquetById(id);
  if (!bouquet) notFound();
  return (
    <main id="main-content" className="sender-page text-center">
      <div className="sender-status"><Check size={16} aria-hidden="true" /> Saved</div>
      <h1 className="stage-title">Ready to make their day.</h1>
      <div className="sender-preview"><Bouquet bouquet={bouquet} /></div>
      <GiftShareTools id={id} />
      <Button asChild variant="outline" size="lg" className="mt-2 mb-6"><Link href={`/gift/${encodeURIComponent(id)}`}><span aria-hidden="true">🌸</span> Preview their surprise</Link></Button>
    </main>
  );
}
