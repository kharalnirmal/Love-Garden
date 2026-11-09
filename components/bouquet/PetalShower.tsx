"use client";

import { useEffect, type CSSProperties } from "react";
import { Heart } from "lucide-react";

export default function PetalShower({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 5600);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="petal-shower" aria-hidden="true">
      {Array.from({ length: 24 }, (_, index) => <span key={index} className={`falling-petal ${index % 4 === 0 ? "falling-heart" : ""}`} style={{
        "--petal-x": `${(index * 37 + 7) % 100}%`,
        "--petal-delay": `${(index % 7) * .13}s`,
        "--petal-sway": `${index % 2 ? -75 : 65}px`,
        "--petal-rotation": `${120 + index * 23}deg`,
      } as CSSProperties}>{index % 4 === 0 && <Heart size={18} strokeWidth={1.2} />}</span>)}
    </div>
  );
}
