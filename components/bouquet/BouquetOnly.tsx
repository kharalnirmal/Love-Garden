import Image from "next/image";
import { flowers } from "../../data/data";
import type { BouquetReadOnlyProps } from "@/types/bouquet";
import { getFlowerInstanceIndex, getFlowerRotation } from "@/lib/bouquet-utils";

export default function BouquetOnly({ bouquet }: BouquetReadOnlyProps) {
  // Helper function to get flower dimensions based on size
  const getFlowerDimensions = (size: string) => {
    switch (size) {
      case "small":
        return 80;
      case "large":
        return 160;
      default:
        return 120; // medium
    }
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center relative py-4 my-4">
        <div className="relative w-[500px] min-h-[410px]">
          {/* Bush background images - positioned absolutely to stay fixed */}
          {/* Bottom bush layer */}

          <Image
            src={`/${bouquet.mode}/bush/bush-${bouquet.greenery + 1}.png`}
            alt="bush background"
            width={600}
            height={500}
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
            priority
          />

          {/* Flower container - flowers can move around within this area */}

          <div className="flex flex-wrap reverse w-[300px] justify-center items-center -space-x-4 -space-y-20 relative m-auto">
            {/* Map through each flower type and create individual flower instances */}
            {bouquet.flowers.flatMap(
              (flower: { id: number; count: number }, flowerIndex: number) => {
                // Get flower data from the imported flowers array
                const flowerData = flowers.find((f) => f.id === flower.id);
                if (!flowerData) return [];

                // For each flower type, create the specified number of instances
                return Array(flower.count)
                  .fill(null)
                  .map((_, instanceIndex) => {
                    // Generate random rotation for each flower (-5 to +5 degrees)
                    const flatIndex = getFlowerInstanceIndex(bouquet.flowers, flowerIndex, instanceIndex);
                    const rotation = getFlowerRotation(flatIndex);

                    // Determine the visual order of this flower instance
                    // If flowerOrder exists, use it; otherwise use default order
                    const index = bouquet.flowerOrder?.length
                      ? bouquet.flowerOrder[
                          flatIndex
                        ] ?? flatIndex
                      : flatIndex;

                    // Get dimensions based on flower size
                    const dimensions = getFlowerDimensions(flowerData.size);

                    return (
                      <div
                        key={`${flowerIndex}-${instanceIndex}`}
                        className="flex items-center justify-center pt-4 relative"
                        style={{ order: index }} // CSS order property controls visual arrangement
                      >
                        {/* Individual flower image */}
                        <Image
                          src={`/${bouquet.mode}/flowers/${flowerData.name}.png`}
                          alt={flowerData.name}
                          width={dimensions}
                          height={dimensions}
                          className="relative z-10 transition-transform hover:scale-105"
                          style={{ transform: `rotate(${rotation}deg)` }} // Apply random rotation
                          priority
                        />
                      </div>
                    );
                  });
              }
            )}
          </div>

          {/* Top bush layer */}

          <div>
            <Image
              src={`/${bouquet.mode}/bush/bush-${bouquet.greenery + 1}-top.png`}
              alt="bush top"
              width={600}
              height={500}
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
