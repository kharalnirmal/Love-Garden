import { listPublicBouquets } from "@/lib/bouquet-repository";
import Image from "next/image";
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
    return <main className="p-8 text-center"><h1>The garden is resting</h1>
      <p className="my-4">We couldn’t load the bouquets. Please try again shortly.</p>
      <Link href="/">Back home</Link></main>;
  }
  return (
    <main className="text-center p-6">
      <Link href="/"><Image src="/digibouquet.png" alt="digibouquet" width={200} height={80}
        className="object-cover mx-auto my-10" priority /></Link>
      <h1 className="text-md mb-4">Our garden</h1>
      <p className="text-sm mb-10">Bouquets shared with everyone. Personal messages stay out of previews.</p>
      {!result.bouquets.length && <p className="my-8">The garden is waiting for its first flowers.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {result.bouquets.map((bouquet) => (
          <Link href={`/bouquet/${bouquet.id}`} key={bouquet.id} aria-label="Open this public bouquet">
            <BouquetOnly bouquet={bouquet} />
            <p className="text-sm text-gray-500 m-6">{new Date(bouquet.created_at).toLocaleDateString("en-US")}</p>
          </Link>
        ))}
      </div>
      {result.nextCursor && <Link className="inline-block border p-3 my-6" href={`/garden?before=${encodeURIComponent(result.nextCursor)}`}>More bouquets</Link>}
    </main>
  );
}
