import { db } from "@/lib/db";
import { SITE_DEFAULTS } from "@/lib/seed";
import type { SiteContent } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import SiteMotion from "@/components/SiteMotion";

/** Public site chrome — header, footer, floating chat and motion. The admin panel sits outside this group. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let site: SiteContent = SITE_DEFAULTS;
  try { site = (await (await db()).getSite()) || SITE_DEFAULTS; } catch { /* fall back to defaults */ }

  return (
    <>
      <Header contact={site.contact} />
      {children}
      <Footer site={site} />
      <WhatsApp number={site.contact.whatsapp} />
      <SiteMotion />
    </>
  );
}
