import { Dispatch, SetStateAction } from "react";

// Full flower data structure (from data source)
export interface Flower {
  id: number;
  name: string;
  meaning: string;
  birthMonth: string;
  size: "small" | "medium" | "large";
  color?: string;
}

// Individual flower type in the bouquet
export interface BouquetFlower {
  id: number;
  count: number;
}

// Letter/card data attached to the bouquet
export interface BouquetLetter {
  sender: string;
  recipient: string;
  message: string;
}

// Main bouquet data structure
export interface Bouquet {
  mode: string;
  flowers: BouquetFlower[];
  letter: BouquetLetter;
  timestamp: number;
  greenery: number;
  flowerOrder: number[];
  visibility?: "unlisted" | "public";
  presentation?: {
    ribbon: "rose" | "sage" | "ivory";
    wrapping: "none" | "cream" | "blush";
    tag: string;
    card: "classic" | "blush" | "botanical";
  };
}

export interface SavedBouquet extends Bouquet {
  id: string;
  created_at: string;
}

// Type for the setBouquet function passed to components
export type SetBouquet = Dispatch<SetStateAction<Bouquet>>;

// Props type for components that receive bouquet and setBouquet
export interface BouquetProps {
  bouquet: Bouquet;
  setBouquet: SetBouquet;
}

// Props type for components that only receive bouquet (read-only)
export interface BouquetReadOnlyProps {
  bouquet: Bouquet;
}
