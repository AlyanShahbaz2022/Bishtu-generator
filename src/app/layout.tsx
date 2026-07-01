import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Suspense } from "react";

import { RouteProgress } from "@/components/layout/route-progress";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/constants/site";
import { env } from "@/lib/env";
import {
  localBusinessSchema,
  organizationSchema,
  websiteSchema,
} from "@/lib/structured-data";
import { Providers } from "@/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Premium Industrial Power Solutions`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  keywords: [
    "industrial generators",
    "diesel generators",
    "generator rental",
    "generator maintenance",
    "power solutions",
    "Pakistan",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Premium Industrial Power Solutions`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Premium Industrial Power Solutions`,
    description: siteConfig.description,
  },
  verification: env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08170E" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <JsonLd data={localBusinessSchema()} />
        <Providers>{children}</Providers>
        {env.NEXT_PUBLIC_GA_ID ? (
          <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} />
        ) : null}
      </body>
    </html>
  );
}
