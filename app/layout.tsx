import type React from "react";
import "../styles/globals.css";
import type { Metadata } from "next";
import { Bodoni_Moda, DM_Sans, Parisienne, Patrick_Hand } from "next/font/google";
import { giftUrl } from "@/lib/gift-sharing";
import { siteDescription, siteTitle } from "@/lib/site-metadata";

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const handwritten = Parisienne({ subsets: ["latin"], weight: "400", variable: "--font-handwritten", display: "swap" });
const note = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-note", display: "swap" });

export const metadata: Metadata = {
  metadataBase: process.env.APP_ORIGIN ? new URL(new URL(giftUrl("preview", process.env.APP_ORIGIN)).origin) : undefined,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  title: { default: siteTitle, template: "%s | Love Garden" },
  description: siteDescription,
  applicationName: "Love Garden",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Love Garden",
    locale: "en_US",
    title: siteTitle,
    description: siteDescription,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Love Garden — Say it with flowers" }],
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, images: ["/opengraph-image"] },
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
