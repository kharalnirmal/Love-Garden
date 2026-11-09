"use client";

import Image from "next/image";
import { flowers } from "../../data/data";
import { useBouquet } from "../../context/BouquetContext";
import { getFlowerInstanceIndex, getFlowerRotation } from "@/lib/bouquet-utils";

export default function BouquetCustomizer() {
  const { bouquet, setBouquet } = useBouquet();
  // Function to randomize the arrangement of flowers
  const randomizeFlowers = () => {
    // Calculate total number of individual flowers (not flower types)
    const totalFlowers = bouquet.flowers.reduce(
      (sum, flower) => sum + flower.count,
      0
    );
    // Create an array of indices from 0 to totalFlowers-1
    const indices = Array.from({ length: totalFlowers }, (_, i) => i);

    // Fisher-Yates shuffle algorithm to randomize the order
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setBouquet((prev) => ({
      ...prev,
      flowerOrder: indices,
    }));
  };

  const changeGreenery = () => {
    setBouquet((prev) => ({
      ...prev,
      greenery: (prev.greenery + 1) % 3,
    }));
  };

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
    <div className="flex flex-col mx-auto max-w-screen-lg">
      {/* Left sidebar - contains customization controls */}
      <div className="p-6">
        <h2 className="mb-6 text-center uppercase text-md">
          Customize Your Bouquet
        </h2>
        <div className="flex flex-col justify-center items-center space-y-4">
          {/* Randomize button - shuffles the flower arrangement */}
          <button
            onClick={randomizeFlowers}
            className="px-5 py-3 text-white uppercase bg-black"
          >
            Try a new Arrangement
          </button>
          <button
            onClick={changeGreenery}
            className="px-5 py-3 text-black uppercase border border-black"
          >
            Change Greenery
          </button>
        </div>
      </div>

      <div className="flex relative justify-center items-center py-4 my-16">
        <div className="relative w-[500px] min-h-[410px]">
          {/* Bush background images - positioned absolutely to stay fixed */}
          {/* Bottom bush layer */}

          <Image
            src={`/${bouquet.mode}/bush/bush-${bouquet.greenery + 1}.png`}
            alt="bush background"
            width={600}
            height={500}
            className="absolute top-1/2 left-1/2 z-0 transform -translate-x-1/2 -translate-y-1/2"
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
                    // If flowerOrder has values, use it; otherwise use default order
                    const index =
                      bouquet.flowerOrder.length > 0
                        ? bouquet.flowerOrder[
                            flatIndex
                          ] ?? flatIndex
                        : flatIndex;

                    // Get dimensions based on flower size
                    const dimensions = getFlowerDimensions(flowerData.size);

                    return (
                      <div
                        key={`${flowerIndex}-${instanceIndex}`}
                        className="flex relative justify-center items-center pt-4"
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
              className="absolute top-1/2 left-1/2 z-10 transform -translate-x-1/2 -translate-y-1/2"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
