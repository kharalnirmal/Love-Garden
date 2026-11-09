export default function WrappingArtwork({ wrapping }: { wrapping: "cream" | "blush" }) {
  const color = wrapping === "blush"
    ? { back: "#dfbdc7", paper: "#f1d9de", fold: "#e7c7d0", edge: "#cda6b2", light: "#faebee" }
    : { back: "#d9cbb3", paper: "#f0e7d5", fold: "#e5d8c0", edge: "#c5b596", light: "#fbf5e8" };
  return (
    <svg className="bouquet-wrap" viewBox="0 0 500 580" fill="none" aria-hidden="true" focusable="false">
      <path d="M59 47L250 124L439 49L348 520Q250 553 152 520Z" fill={color.back} />
      <path d="M42 161L112 92L342 334L326 535L160 521Z" fill={color.paper} stroke={color.edge} />
      <path d="M456 153L391 83L178 329L160 521L326 535Z" fill={color.light} stroke={color.edge} />
      <path d="M42 161L284 368L326 535L160 521Z" fill={color.fold} />
      <path d="M456 153L229 370L160 521L326 535Z" fill={color.paper} />
      <path d="M229 370L326 535M284 368L160 521" stroke={color.edge} strokeOpacity=".55" />
      <path d="M48 163L284 368M451 157L229 370" stroke={color.light} strokeWidth="3" />
    </svg>
  );
}
