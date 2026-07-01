import type { MetadataRoute } from "next";

import { siteConfig } from "@/constants/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — Premium Industrial Power Solutions`,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#08170E",
    theme_color: "#08170E",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
