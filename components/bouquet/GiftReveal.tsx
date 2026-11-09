"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SavedBouquet } from "@/types/bouquet";
import Bouquet from "./Bouquet";
import FlowerArtwork from "./FlowerArtwork";
import PetalShower from "./PetalShower";

export default function GiftReveal({ bouquet }: { bouquet: SavedBouquet }) {
  const [opened, setOpened] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const finishCelebrating = useCallback(() => setCelebrating(false), []);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (opened) headingRef.current?.focus({ preventScroll: true });
  }, [opened]);

  function openBouquet() {
    setOpened(true);
    setCelebrating(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  return (
    <section className="gift-reveal" data-open={opened}>
      {celebrating && <PetalShower onComplete={finishCelebrating} />}
      {!opened ? (
        <div className="gift-closed gentle-enter">
          <div className="gift-floral-welcome" aria-hidden="true"><FlowerArtwork bouquet={{ ...bouquet, presentation: { ribbon: bouquet.presentation?.ribbon ?? "rose", wrapping: "none", tag: "", card: "classic" } }} /></div>
          <div className="gift-envelope" aria-hidden="true">
            <div className="envelope-letter"><Image src={`/${bouquet.mode === "mono" ? "mono" : "color"}/flowers/peony.png`} alt="" width={90} height={90} priority /></div>
            <div className="envelope-fold" />
            <span className="envelope-seal"><Heart size={24} strokeWidth={1.3} /></span>
          </div>
          <h1 className="stage-title">Just for you.</h1>
          <Button size="lg" onClick={openBouquet}><MailOpen aria-hidden="true" /> Open your bouquet</Button>
        </div>
      ) : (
        <div className="gift-open-content gift-bloom-in">
          <h1 className="stage-title" tabIndex={-1} ref={headingRef}>{bouquet.letter.recipient ? `For ${bouquet.letter.recipient}.` : "Just for you."}</h1>
          <Bouquet bouquet={bouquet} />
          <Button asChild size="lg" variant="outline" className="gift-return-action"><Link href="/bouquet?mode=color"><span aria-hidden="true">🌸</span> Send flowers back</Link></Button>
        </div>
      )}
    </section>
  );
}
