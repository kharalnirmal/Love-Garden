import Link from "next/link";

export default function MissingBouquet() {
  return <main className="p-8 text-center"><h1>We couldn’t find that bouquet</h1>
    <p className="my-4">Check your gift link, or make something lovely of your own.</p>
    <Link href="/bouquet?mode=color" className="underline">Create a bouquet</Link></main>;
}
