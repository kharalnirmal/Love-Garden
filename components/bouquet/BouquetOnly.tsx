import type { BouquetReadOnlyProps } from "@/types/bouquet";
import FlowerArtwork from "./FlowerArtwork";

export default function BouquetOnly({ bouquet }: BouquetReadOnlyProps) {
  return <FlowerArtwork bouquet={bouquet} />;
}
