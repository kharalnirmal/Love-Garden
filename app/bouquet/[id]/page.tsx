// app/bouquet/[id]/page.tsx
import { getBouquetById } from "@/lib/bouquet-repository";
import { notFound } from "next/navigation";
import Bouquet from "../../../components/bouquet/Bouquet";
import Image from "next/image";
import Link from "next/link";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function BouquetPage(props: Params) {
  const params = await props.params;
  const { id } = params;

  const data = await getBouquetById(id);
  if (!data) notFound();

  return (
    <div className="text-center p-6 bg-[#F9F9EE]">
      {/* Logo/Branding */}
      <Link href="/">
        <Image
          src="/digibouquet.png"
          alt="digibouquet"
          width={200}
          height={80}
          className="object-cover mx-auto my-10"
          priority
        />
      </Link>
      <h2 className="text-lg mb-14 ">Hi, I made this bouquet for you!</h2>
      <Bouquet bouquet={data} />
      <p className="text-sm text-gray-500">
        made with digibouquet, a tool by{" "}
        <Link
          href="https://x.com/pau_wee_"
          className="text-sm underline text-gray-500 mt-2"
        >
          @pau_wee_
        </Link>
      </p>
      <Link href="/" className="text-sm underline text-gray-500 mt-2">
        make a bouquet now!
      </Link>
    </div>
  );
}
