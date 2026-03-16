import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sahha — صحة",
    short_name: "Sahha",
    description: "Gamified nutrition tracking — Duolingo for nutrition",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0d1117",
    theme_color: "#34d399",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
