import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Love Garden",
    short_name: "Love Garden",
    description: "Personal flowers and a handwritten note for someone you love.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#744354",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
