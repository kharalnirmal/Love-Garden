import Link from "next/link";
import { Caveat } from "next/font/google";
import { Feather, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Credits from "@/components/Credits";
import FlowerArtwork from "@/components/bouquet/FlowerArtwork";
import type { Bouquet } from "@/types/bouquet";

const caveat = Caveat({ subsets: ["latin"], weight: "700", display: "swap" });
export const metadata = { alternates: { canonical: "/" } };

const welcomeBouquet: Bouquet = {
  mode: "color",
  flowers: [11, 2, 10, 4, 9, 5, 6, 12, 7].map((id) => ({ id, count: 1 })),
  flowerOrder: [3, 0, 6, 2, 1, 5, 8, 7, 4],
  greenery: 1,
  letter: { sender: "", recipient: "", message: "" },
  timestamp: 0,
  presentation: { ribbon: "rose", wrapping: "cream", tag: "", card: "classic" },
};

export default function Home() {
  return (
    <div className="home-shell">
      <div className="home-floral-backdrop" aria-hidden="true" />
      <p className="home-wordmark">Love Garden</p>
      <main id="main-content">
        <section className="home-hero">
          <div className="hero-copy">
            <h1 className={caveat.className}>Say it with<br /><em>flowers.</em></h1>
            <div className="hero-actions">
              <Button asChild size="lg" className="home-action"><Link href="/bouquet?mode=color"><Heart aria-hidden="true" /> Create a bouquet</Link></Button>
              <Button asChild size="lg" variant="outline" className="home-action"><Link href="/bouquet?mode=mono"><Feather aria-hidden="true" /> Black &amp; white</Link></Button>
            </div>
          </div>
          <div className="hero-bouquet">
            <div className="hero-orbit" aria-hidden="true" />
            <div className="hero-flower-preview" role="img" aria-label="A hand-tied bouquet of nine garden flowers"><FlowerArtwork bouquet={welcomeBouquet} /></div>
            <Link href="/garden" className="garden-annotation">
              <span>Explore the garden</span>
              <svg viewBox="0 0 145 75" fill="none" aria-hidden="true"><path d="M5 13C47-5 103 8 124 57M106 49l19 11 6-22" /></svg>
            </Link>
          </div>
        </section>
      </main>
      <Credits />
    </div>
  );
}
