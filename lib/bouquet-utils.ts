import type { BouquetFlower } from "@/types/bouquet";

export function generateDefaultFlowerOrder(flowers: BouquetFlower[]): number[] {
  const totalFlowers = flowers.reduce((sum, flower) => sum + flower.count, 0);
  return Array.from({ length: totalFlowers }, (_, i) => i);
}

export function createFlowerCountMap(
  flowers: BouquetFlower[]
): Record<number, number> {
  const map: Record<number, number> = {};
  flowers.forEach((flower) => {
    map[flower.id] = flower.count;
  });
  return map;
}

export function calculateTotalFlowers(flowers: BouquetFlower[]): number {
  return flowers.reduce((sum, flower) => sum + flower.count, 0);
}

export function validateFlowerCount(flowers: BouquetFlower[]): boolean {
  const total = calculateTotalFlowers(flowers);
  return total >= 6 && total <= 10;
}

// Flattened offsets must use preceding quantities, not flowerIndex * count.
export function getFlowerInstanceIndex(flowers: BouquetFlower[], flowerIndex: number, instanceIndex: number): number {
  return flowers.slice(0, flowerIndex).reduce((sum, flower) => sum + flower.count, 0) + instanceIndex;
}

export function getFlowerRotation(index: number): number {
  return ((index * 7 + 3) % 11) - 5;
}
