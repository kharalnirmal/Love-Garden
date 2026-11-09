import type { BouquetReadOnlyProps } from "@/types/bouquet";
import FlowerArtwork from "./FlowerArtwork";

export default function Bouquet({ bouquet }: BouquetReadOnlyProps) {
  return (
    <div className="bouquet-display text-center">
      <div className="bouquet-flowers"><FlowerArtwork bouquet={bouquet} /></div>
      <div className="bouquet-note mx-auto max-w-sm text-sm text-center">
        <div className="received-card p-8 mx-auto" data-card={bouquet.presentation?.card ?? "classic"}>
          <div className="space-y-4">
            <p className="text-left">Dear {bouquet.letter.recipient}</p>
            <p className="text-left">{bouquet.letter.message}</p>
            <div className="text-right"><p>Sincerely,</p><p>{bouquet.letter.sender}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
