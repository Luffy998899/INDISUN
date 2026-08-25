import { db } from "@/lib/db";
import { SITE_DEFAULTS } from "@/lib/seed";
import type { SiteContent } from "@/lib/types";
import Header from "@/components/Header";
import WhatsApp from "@/components/WhatsApp";
import SiteMotion from "@/components/SiteMotion";

/** The landing page ends with its own full-screen CTA finale, so it omits the shared footer. */
export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  let site: SiteContent = SITE_DEFAULTS;
  try { site = (await (await db()).getSite()) || SITE_DEFAULTS; } catch { /* fall back to defaults */ }

  return (
    <>
      <Header contact={site.contact} />
      {children}
      <WhatsApp number={site.contact.whatsapp} />
      <SiteMotion />
    </>
  );
}
