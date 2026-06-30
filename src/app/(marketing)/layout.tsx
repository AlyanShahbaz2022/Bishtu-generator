import { CookieConsent } from "@/components/layout/cookie-consent";
import { FloatingActions } from "@/components/layout/floating-actions";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

/**
 * Public marketing/storefront shell: fixed navbar, content, footer, and the
 * floating WhatsApp/call/back-to-top + cookie-consent chrome. Auth and
 * dashboard routes use their own layouts and intentionally omit this.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <FloatingActions />
      <CookieConsent />
    </>
  );
}
