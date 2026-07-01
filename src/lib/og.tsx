import type { ReactElement } from "react";

import { siteConfig } from "@/constants/site";

/** Standard OG image dimensions (1200×630) and content type. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/**
 * Branded OG image template shared by the site-wide and per-route
 * `opengraph-image` routes. Rendered by `next/og`'s ImageResponse — uses inline
 * styles only (no Tailwind) since satori has a limited CSS subset.
 */
export function OgTemplate({
  title,
  eyebrow,
  subtitle,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
}): ReactElement {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        backgroundColor: "#08170E",
        backgroundImage:
          "radial-gradient(circle at 85% 15%, #122C1D 0%, #08170E 60%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            backgroundColor: "#4CAF50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "34px",
          }}
        >
          ⚡
        </div>
        <span style={{ fontSize: "34px", fontWeight: 800 }}>
          {siteConfig.name}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {eyebrow ? (
          <span
            style={{
              fontSize: "26px",
              color: "#76C043",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            {eyebrow}
          </span>
        ) : null}
        <span
          style={{
            fontSize: "68px",
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: "1000px",
          }}
        >
          {title}
        </span>
        {subtitle ? (
          <span
            style={{ fontSize: "30px", color: "#c9d6cd", maxWidth: "900px" }}
          >
            {subtitle}
          </span>
        ) : null}
      </div>

      <span style={{ fontSize: "24px", color: "#89a091" }}>
        {siteConfig.url.replace(/^https?:\/\//, "")}
      </span>
    </div>
  );
}
