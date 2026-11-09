type Ribbon = "rose" | "sage" | "ivory";

const colors = {
  rose: { base: "#af7185", light: "#cf9aab", shade: "#875065", edge: "#966075" },
  sage: { base: "#84947a", light: "#afbaa5", shade: "#5f7056", edge: "#738268" },
  ivory: { base: "#ddc8a7", light: "#f4e8d1", shade: "#b79c75", edge: "#c5ac88" },
};

export default function RibbonArtwork({ ribbon }: { ribbon: Ribbon }) {
  const color = colors[ribbon];
  return (
    <svg viewBox="0 0 180 140" fill="none" aria-hidden="true" focusable="false">
      <path d="M78 51C70 76 61 98 43 120L63 115L70 131C80 110 89 83 91 56Z" fill={color.base} />
      <path d="M96 51C107 74 113 103 134 124L136 106L155 110C129 82 119 64 108 48Z" fill={color.base} />
      <path d="M80 62C76 90 70 108 63 120M108 62C116 86 125 106 139 116" stroke={color.light} strokeWidth="3" strokeLinecap="round" />
      <path d="M82 45C62 11 31 6 19 23C6 43 30 72 80 57Z" fill={color.base} stroke={color.edge} />
      <path d="M81 46C58 21 31 18 26 31C23 43 44 53 77 51Z" fill={color.shade} />
      <path d="M25 27C36 14 62 27 80 47" stroke={color.light} strokeWidth="5" strokeLinecap="round" />
      <path d="M99 45C123 12 153 8 165 27C175 46 147 72 102 57Z" fill={color.base} stroke={color.edge} />
      <path d="M102 47C127 24 151 21 156 33C158 45 136 55 105 51Z" fill={color.shade} />
      <path d="M157 28C145 18 119 30 102 47" stroke={color.light} strokeWidth="5" strokeLinecap="round" />
      <path d="M80 39Q92 35 103 41L105 62Q93 66 80 61Q75 50 80 39Z" fill={color.base} stroke={color.edge} />
      <path d="M86 41Q82 51 86 60" stroke={color.light} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
