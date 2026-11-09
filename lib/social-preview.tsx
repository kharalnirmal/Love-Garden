import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { flowers } from "@/data/data";

export const socialImageSize = { width: 1200, height: 630 };

export async function socialPreview({ names = ["daisy", "tulip", "peony", "rose", "ranunculus"], mode = "color", gift = false }: { names?: string[]; mode?: "color" | "mono"; gift?: boolean } = {}) {
  // Only fixed catalog names may become local asset paths. Never render private gift text.
  const safeNames = names.filter((name) => flowers.some((flower) => flower.name === name)).slice(0, 5);
  const images = await Promise.all(safeNames.map(async (name) => {
    const image = await readFile(join(process.cwd(), "public", mode, "flowers", `${name}.png`));
    return `data:image/png;base64,${image.toString("base64")}`;
  }));

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#faf5ee", color: "#63394a", position: "relative", padding: "60px 70px", overflow: "hidden" }}>
      <div style={{ display: "flex", position: "absolute", inset: 22, border: "1px solid #dfcfc3" }} />
      <div style={{ display: "flex", position: "absolute", width: 500, height: 500, right: 18, top: 54, borderRadius: "46% 54% 42% 58%", background: "#e9ecdf" }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 590, padding: "14px 0" }}>
        <div style={{ fontSize: 23, letterSpacing: 5 }}>LOVE GARDEN</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: gift ? 70 : 82, fontWeight: 700, lineHeight: 1.08, letterSpacing: -3 }}>{gift ? "A little love," : "Say it with"}</div>
          <div style={{ fontSize: gift ? 70 : 82, fontWeight: 700, lineHeight: 1.08, letterSpacing: -3, color: "#a45e78" }}>{gift ? "just for you." : "flowers."}</div>
          <div style={{ fontSize: 23, lineHeight: 1.5, color: "#6e7063", marginTop: 26, maxWidth: 440 }}>{gift ? "A bouquet. A little note. A reason to smile." : "Your flowers. Your words. Their smile."}</div>
        </div>
        <div style={{ fontSize: 18, letterSpacing: 2, color: "#68765d" }}>{gift ? "OPEN YOUR SURPRISE" : "PICK · WRITE · SEND A LITTLE LOVE"}</div>
      </div>
      <div style={{ display: "flex", position: "absolute", right: 20, top: 90, width: 490, height: 450 }}>
        {/* Embedded local artwork is required by the server-side image renderer. */}
        {/* eslint-disable @next/next/no-img-element */}
        {images.map((src, index) => <img key={index} alt="" src={src} width={205} height={380} style={{ position: "absolute", left: 20 + index * 59, top: index % 2 ? 5 : 44, objectFit: "contain", transform: `rotate(${-24 + index * 12}deg)` }} />)}
        {/* eslint-enable @next/next/no-img-element */}
      </div>
    </div>
  );
}
