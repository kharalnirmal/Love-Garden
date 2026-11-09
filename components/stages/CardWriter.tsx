import Image from "next/image";
import { Heart, Leaf } from "lucide-react";
import ChoiceGroup from "@/components/ui/ChoiceGroup";
import { useBouquet } from "../../context/BouquetContext";

export default function CardWriter() {
  const { bouquet, setBouquet } = useBouquet();
  return (
    <div className="text-center card-writer">
      <div>
        <h1 className="stage-title">A little note.</h1>
        <div className="card-style-picker"><ChoiceGroup name="card-style" legend="Card style" hideLegend value={bouquet.presentation?.card ?? "classic"}
          onChange={(card) => setBouquet((previous) => ({ ...previous, presentation: { ribbon: "rose", wrapping: "none", tag: "", ...previous.presentation, card } }))}
          options={(["classic", "blush", "botanical"] as const).map((style) => ({ value: style, label: style, preview: <span className="card-style-swatch" data-style={style}>{style === "blush" ? <Heart size={10} /> : style === "botanical" ? <Leaf size={10} /> : null}<span /><span /></span> }))} /></div>
        <div className="card-scene">
          <div className="card-flowers" aria-hidden="true">
            <Image
              src={`/full/flowers/daisy.png`}
              alt="card front"
              width={140}
              height={200}
              className="-rotate-12 hover:-translate-y-4 transition-all duration-300"
            />
            <Image
              src={`/full/flowers/lily.png`}
              alt="card front"
              width={140}
              height={200}
              className="-translate-y-5 hover:-translate-y-4 transition-all duration-300"
            />
            <Image
              src={`/full/flowers/anemone.png`}
              alt="card front"
              width={140}
              height={200}
              className="rotate-12 hover:-translate-y-4 transition-all duration-300"
            />
          </div>

          <div className="writing-card" data-card={bouquet.presentation?.card ?? "classic"}>
            <div className="space-y-4">
              <div className="flex flex-row items-left justify-left gap-2">
                <label htmlFor="recipient">Dear </label>
                <input
                  id="recipient"
                  maxLength={80}
                  value={bouquet.letter.recipient || ""}
                  onChange={(e) =>
                    setBouquet((prev) => ({
                      ...prev,
                      letter: {
                        ...prev.letter,
                        recipient: e.target.value,
                      },
                    }))
                  }
                  placeholder="Beloved,"
                  className="border-none bg-transparent focus:outline-none focus:ring-0"
                />{" "}
              </div>
              <div>
                <textarea
                  id="message"
                  aria-label="Personal message"
                  maxLength={2000}
                  value={bouquet.letter.message || ""}
                  onChange={(e) =>
                    setBouquet((prev) => ({
                      ...prev,
                      letter: {
                        ...prev.letter,
                        message: e.target.value,
                      },
                    }))
                  }
                  placeholder="Something about you makes ordinary days feel special…"
                  rows={5}
                   className="w-full border-none bg-transparent focus:outline-none focus:ring-0"
                />
                <p className="character-count">{bouquet.letter.message.length} / 2,000</p>
              </div>

              <div className="flex flex-col items-right justify-end gap-2">
                <label htmlFor="sender" className="text-right">
                  Sincerely,
                </label>
                <input
                  id="sender"
                  maxLength={80}
                  value={bouquet.letter.sender || ""}
                  onChange={(e) =>
                    setBouquet((prev) => ({
                      ...prev,
                      letter: {
                        ...prev.letter,
                        sender: e.target.value,
                      },
                    }))
                  }
                  placeholder="Secret Admirer"
                  className="border-none bg-transparent text-right focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="card-flowers" aria-hidden="true">
            <Image
              src={`/full/flowers/carnation.png`}
              alt="card front"
              width={140}
              height={200}
              className="-rotate-12 hover:-translate-y-4 transition-all duration-300"
            />
            <Image
              src={`/full/flowers/sunflower.png`}
              alt="card front"
              width={140}
              height={200}
              className="-translate-y-5 hover:-translate-y-4 transition-all duration-300"
            />
            <Image
              src={`/full/flowers/peony.png`}
              alt="card front"
              width={140}
              height={200}
              className="rotate-12 hover:-translate-y-4 transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
