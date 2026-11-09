"use client";

import { Shuffle, Leaf, Tag, Minus } from "lucide-react";
import type { Bouquet } from "@/types/bouquet";
import { useBouquet } from "@/context/BouquetContext";
import FlowerArtwork from "@/components/bouquet/FlowerArtwork";
import RibbonArtwork from "@/components/bouquet/RibbonArtwork";
import ChoiceGroup from "@/components/ui/ChoiceGroup";
import { Button } from "@/components/ui/button";

export default function BouquetCustomizer() {
  const { bouquet, setBouquet, totalFlowers } = useBouquet();
  const presentation = bouquet.presentation ?? { ribbon: "rose", wrapping: "none", tag: "", card: "classic" };

  function personalize(patch: Partial<NonNullable<Bouquet["presentation"]>>) {
    setBouquet((previous) => ({ ...previous, presentation: { ribbon: "rose", wrapping: "none", tag: "", card: "classic", ...previous.presentation, ...patch } }));
  }

  function shuffle() {
    const order = Array.from({ length: totalFlowers }, (_, index) => index);
    for (let index = order.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [order[index], order[other]] = [order[other], order[index]];
    }
    setBouquet((previous) => ({ ...previous, flowerOrder: order }));
  }

  return (
    <div className="arrange-stage">
      <div className="arrange-controls">
        <h1 className="stage-title">Make it yours.</h1>
        <div className="arrange-actions">
          <Button onClick={shuffle} variant="outline"><Shuffle aria-hidden="true" /> Shuffle</Button>
          <Button onClick={() => setBouquet((previous) => ({ ...previous, greenery: (previous.greenery + 1) % 3 }))} variant="outline"><Leaf aria-hidden="true" /> Greenery</Button>
        </div>
        <div className="personalization-controls">
          <ChoiceGroup name="ribbon" legend="Ribbon" value={presentation.ribbon} compact onChange={(ribbon) => personalize({ ribbon })} options={(["rose", "sage", "ivory"] as const).map((ribbon) => ({ value: ribbon, label: ribbon, preview: <span className="ribbon-thumbnail"><RibbonArtwork ribbon={ribbon} /></span> }))} />
          <ChoiceGroup name="wrapping" legend="Wrap" value={presentation.wrapping} compact onChange={(wrapping) => personalize({ wrapping })} options={(["none", "cream", "blush"] as const).map((wrapping) => ({ value: wrapping, label: wrapping, preview: <span className="wrap-thumbnail" data-wrap={wrapping}>{wrapping === "none" && <Minus size={17} />}</span> }))} />
          <label className="tag-input"><span>Gift tag <span className="optional-label">Optional</span></span><span className="tag-field"><Tag size={15} aria-hidden="true" /><input value={presentation.tag} maxLength={40} placeholder="For you" onChange={(event) => personalize({ tag: event.target.value })} /><span className="tag-count" aria-hidden="true">{presentation.tag.length}/40</span></span></label>
        </div>
      </div>
      <FlowerArtwork bouquet={bouquet} />
    </div>
  );
}
