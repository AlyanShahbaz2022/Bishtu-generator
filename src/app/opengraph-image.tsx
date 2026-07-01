import { ImageResponse } from "next/og";

import { siteConfig } from "@/constants/site";
import { OgTemplate, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = `${siteConfig.name} — Premium Industrial Power Solutions`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    <OgTemplate
      eyebrow="Industrial Power Solutions"
      title="Premium Generators. Sales, Rental & Service."
      subtitle="Diesel & petrol generators, maintenance, and genuine spare parts."
    />,
    size,
  );
}
