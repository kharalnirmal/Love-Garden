import Image from "next/image";
import { flowers } from "@/data/data";
import { getFlowerInstanceIndex, getFlowerRotation } from "@/lib/bouquet-utils";
import type { BouquetReadOnlyProps } from "@/types/bouquet";
import RibbonArtwork from "./RibbonArtwork";
import WrappingArtwork from "./WrappingArtwork";

// A reserved, scaled canvas keeps every layer inside the preview's layout box.
// All renderers share the same composition, including saved and public bouquets.
export default function FlowerArtwork({ bouquet }: BouquetReadOnlyProps) {
  return (
    <div className="flower-art-frame">
      <div className="flower-art-canvas">
        {bouquet.presentation && bouquet.presentation.wrapping !== "none" && <WrappingArtwork wrapping={bouquet.presentation.wrapping} />}
        <Image src={`/${bouquet.mode}/bush/bush-${bouquet.greenery + 1}.png`} alt="" width={500} height={500} className="art-greenery" priority />
        <div className="art-blooms">
          {bouquet.flowers.flatMap((flower, flowerIndex) => {
            const data = flowers.find((item) => item.id === flower.id);
            if (!data) return [];
            const size = data.size === "small" ? 80 : data.size === "large" ? 160 : 120;
            return Array.from({ length: flower.count }, (_, instanceIndex) => {
              const index = getFlowerInstanceIndex(bouquet.flowers, flowerIndex, instanceIndex);
              return (
                <div key={`${flower.id}-${instanceIndex}`} className="art-bloom" style={{ order: bouquet.flowerOrder[index] ?? index }}>
                  <Image src={`/${bouquet.mode}/flowers/${data.name}.png`} alt={data.name} width={size} height={size} style={{ transform: `rotate(${getFlowerRotation(index)}deg)` }} priority />
                </div>
              );
            });
          })}
        </div>
        <Image src={`/${bouquet.mode}/bush/bush-${bouquet.greenery + 1}-top.png`} alt="" width={500} height={500} className="art-greenery art-greenery-front" priority />
        {bouquet.presentation && <div className="bouquet-ribbon"><RibbonArtwork ribbon={bouquet.presentation.ribbon} /></div>}
        {bouquet.presentation?.tag && <p className="bouquet-tag">{bouquet.presentation.tag}</p>}
      </div>
    </div>
  );
}
