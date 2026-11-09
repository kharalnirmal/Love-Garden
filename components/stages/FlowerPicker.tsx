"use client";

import Image from "next/image";
import { Minus } from "lucide-react";
import { flowers } from "../../data/data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBouquet } from "../../context/BouquetContext";
import { createFlowerCountMap } from "@/lib/bouquet-utils";
import type { Flower } from "@/types/bouquet";

// Type the flowers data from the imported data file using the proper Flower interface
const flowersData = flowers as Flower[];

export default function FlowerPicker() {
  const { bouquet, totalFlowers, addFlower, removeFlower } = useBouquet();

  // Convert bouquet flowers array to a map for easier counting and display
  // This creates a lookup table: flowerId -> count using utility function
  const selectedFlowersMap = createFlowerCountMap(bouquet.flowers);

  return (
    <TooltipProvider disableHoverableContent delayDuration={0}>
      <div className="h-full text-center flower-picker">
        {/* Page title */}
        <h1 className="stage-title">Pick your blooms.</h1>
        <p className="stage-description">Choose 6–10 stems.</p>

        {/* Grid of available flowers */}
        <div className="flower-grid">
          {flowersData.map((flower) => (
            <Tooltip key={flower.id}>
              <TooltipTrigger asChild>
                <button
                  className="flower-tile"
                  data-selected={Boolean(selectedFlowersMap[flower.id])}
                  disabled={totalFlowers >= 10}
                  aria-label={`Add ${flower.name}`}
                  onClick={(event) => {
                    event.preventDefault();
                    addFlower(flower);
                  }} // Add flower on click
                >
                  {/* Flower image container with dynamic sizing based on flower size */}
                  <div
                    className={`${
                      flower.size === "small"
                        ? "w-32 h-32"
                        : flower.size === "large"
                        ? "w-48 h-48"
                        : "w-40 h-40"
                     } flower-tile-image flex items-center justify-center transition-transform duration-300 overflow-hidden ${
                      // Add selection effect
                      selectedFlowersMap[flower.id]
                        ? "transform -translate-y-2"
                        : ""
                    } hover:transform hover:-translate-y-2`}
                  >
                    {/* Flower image */}

                    <Image
                      src={
                        "/" + bouquet.mode + "/flowers/" + flower.name + ".png"
                      }
                      alt={flower.name}
                      width={
                        flower.size === "small"
                          ? 128
                          : flower.size === "large"
                          ? 192
                          : 160
                      }
                      height={
                        flower.size === "small"
                          ? 128
                          : flower.size === "large"
                          ? 192
                          : 160
                      }
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Count badge - shows how many of this flower are selected */}
                  {selectedFlowersMap[flower.id] && (
                    <div className="flex absolute top-0 right-0 justify-center items-center w-5 h-5 text-xs rounded-full bg-primary text-primary-foreground sm:w-6 sm:h-6">
                      {selectedFlowersMap[flower.id]}
                    </div>
                  )}
                  <span className="flower-name">{flower.name}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent
                onPointerDownOutside={(e) => e.preventDefault()}
                side="bottom"
                sideOffset={8}
                className="z-10 p-2 w-40 text-center sm:w-48"
              >
                <h3 className="font-bold uppercase text-md">{flower.name}</h3>
                <p className="text-sm">{flower.meaning}</p>
                <p className="text-sm">Birth Month: {flower.birthMonth}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Selected flowers summary */}
        <div className="mt-4">
          {/* List of selected flowers with counts - clickable to remove */}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {Object.entries(selectedFlowersMap).map(([id, count]) => {
              const flower = flowersData.find(
                (f) => f.id === Number.parseInt(id)
              );
              if (!flower) return null;
              return (
                <button
                  key={id}
                  className="px-3 py-1 text-sm rounded-full border transition-colors cursor-pointer border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => removeFlower(Number.parseInt(id))} // Remove flower on click
                  aria-label={`Remove one ${flower.name}`}
                >
                   {flower.name} × {count} <Minus size={13} className="inline" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
        <div className="bloom-meter" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <span key={index} data-filled={index < totalFlowers} />)}</div>
        <p role="status" className="my-4 text-sm">{totalFlowers} / 10{totalFlowers < 6 ? ` · ${6 - totalFlowers} more to start` : totalFlowers === 10 ? " · Full" : " · Ready"}</p>
      </div>
    </TooltipProvider>
  );
}
