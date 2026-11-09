import Image from "next/image";
import { useBouquet } from "../../context/BouquetContext";

export default function CardWriter() {
  const { bouquet, setBouquet } = useBouquet();
  return (
    <div className="text-center">
      <div>
        <h2 className="text-md my-8">WRITE THE CARD</h2>
        <div className="flex flex-row items-center justify-center">
          {/* White card container with black border */}
          <div className="flex flex-row items-center justify-center -space-x-12">
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

          <div className="bg-white border-2 border-black p-10 max-w-lg mx-10">
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
                  placeholder="I have so much to tell you, but only this much space on this card! Still, you must know..."
                  rows={5}
                  className="w-full border-none bg-transparent focus:outline-none focus:ring-0"
                />
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

          <div className="flex flex-row items-center justify-center -space-x-12">
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
