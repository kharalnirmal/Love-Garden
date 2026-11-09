import { listPublicBouquets } from "@/lib/bouquet-repository";
import { ArrowRight, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BouquetOnly from "@/components/bouquet/BouquetOnly";
import { shareIdSchema } from "@/lib/bouquet-validation";

export const dynamic = "force-dynamic";

export default async function AllBouquetsPage({ searchParams }: {
  searchParams: Promise<{ before?: string }>;
}) {
  const { before } = await searchParams;
  const cursor = shareIdSchema.safeParse(before);
  let result: Awaited<ReturnType<typeof listPublicBouquets>>;
  try {
    result = await listPublicBouquets(cursor.success ? cursor.data : undefined);
  } catch {
    return <main id="main-content" className="p-8 text-center"><h1>The garden is resting</h1>
      <p className="my-4">We couldn’t load the bouquets. Please try again shortly.</p>
      <Link href="/">Back home</Link></main>;
  }
  return (
    <main id="main-content" className="garden-page text-center p-6">
      <h1 className="stage-title">The garden.</h1>
      <Link href="/bouquet?mode=color" className="quiet-link mb-8"><Flower2 size={17} aria-hidden="true" /> Make your own</Link>
      {!result.bouquets.length && <p className="my-8">The garden is waiting for its first flowers.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {result.bouquets.map((bouquet) => (
          <Link className="gallery-bouquet" href={`/garden/${bouquet.id}`} key={bouquet.id} aria-label="View this bouquet design">
            <BouquetOnly bouquet={bouquet} />
            <p className="text-sm text-gray-500 m-6">{new Date(bouquet.created_at).toLocaleDateString("en-US")}</p>
          </Link>
        ))}
      </div>
      {result.nextCursor && <Button asChild variant="outline" className="my-6"><Link href={`/garden?before=${encodeURIComponent(result.nextCursor)}`}>More bouquets <ArrowRight aria-hidden="true" /></Link></Button>}
    </main>
  );
}
