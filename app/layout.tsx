import type React from "react";
import "../styles/globals.css";
import type { Metadata } from "next";
import { Bodoni_Moda, DM_Sans, Parisienne, Patrick_Hand } from "next/font/google";
import { giftUrl } from "@/lib/gift-sharing";

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const handwritten = Parisienne({ subsets: ["latin"], weight: "400", variable: "--font-handwritten", display: "swap" });
const note = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-note", display: "swap" });

export const metadata: Metadata = {
  metadataBase: process.env.APP_ORIGIN ? new URL(new URL(giftUrl("preview", process.env.APP_ORIGIN)).origin) : undefined,
  icons: {
    icon: "/favicon.ico",
  },
  title: { default: "Love Garden — a little love, in bloom", template: "%s | Love Garden" },
  description: "Pick meaningful flowers, write a personal note, and send a little love with a digital bouquet.",
  openGraph: {
    title: "Love Garden",
    description: "Some feelings deserve flowers. Make a bouquet for someone you love.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${handwritten.variable} ${note.variable}`}>
      <body><a href="#main-content" className="skip-link">Skip to content</a>{children}</body>
    </html>
  );
}
