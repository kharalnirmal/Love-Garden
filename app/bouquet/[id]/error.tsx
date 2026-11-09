"use client";

export default function BouquetError({ reset }: { reset: () => void }) {
  return <main className="p-8 text-center"><h1>Your gift is taking a moment</h1>
    <p className="my-4">We couldn’t load it right now. Please try again.</p>
    <button onClick={reset} className="border px-5 py-3">Try again</button></main>;
}
