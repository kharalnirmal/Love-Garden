import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FlowerArtwork from "@/components/bouquet/FlowerArtwork";
import { getPublicDesignById } from "@/lib/bouquet-repository";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "A bloom from the garden",
  description: "A bouquet design shared with Love Garden. Just flowers, never the personal note.",
  robots: { index: false, follow: false },
};

export default async function GardenDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const bouquet = await getPublicDesignById((await params).id);
  if (!bouquet) notFound();
  return (
    <main id="main-content" className="garden-page p-6 text-center">
      <h1 className="stage-title">A little garden beauty.</h1>
      <FlowerArtwork bouquet={bouquet} />
      <div className="flex flex-wrap justify-center gap-3 my-6">
        <Button asChild variant="outline"><Link href="/garden">Back to the garden</Link></Button>
        <Button asChild><Link href="/bouquet?mode=color"><span aria-hidden="true">🌸</span> Make your own</Link></Button>
      </div>
    </main>
  );
}
