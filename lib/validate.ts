import "server-only";
import crypto from "node:crypto";
import { CATEGORIES, type Category, type Product, type SiteContent } from "./types";
import { SITE_DEFAULTS } from "./seed";

export const slug = (s: unknown) =>
  String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

const supabaseHost = (() => {
  try { return process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : ""; } catch { return ""; }
})();

/** Only allow image paths we control: /img/..., /uploads/... or our Supabase storage bucket. */
export const imageOk = (v: string) =>
  /^\/(img|uploads)\/[\w./-]+$/.test(v) || (!!supabaseHost && v.startsWith(supabaseHost + "/storage/"));

const str = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

/* eslint-disable @typescript-eslint/no-explicit-any */
export function cleanProduct(b: any, existing?: Product | null): { product: Product; errors: Record<string, string> } {
  const image = str(b.image, 400);
  const product: Product = {
    id: existing?.id || (b.id && slug(b.id)) || slug(b.brand) || crypto.randomUUID().slice(0, 8),
    brand: str(b.brand, 80),
    molecule: str(b.molecule, 200),
    category: (CATEGORIES.includes(b.category) ? b.category : "tablets") as Category,
    segment: str(b.segment, 60),
    pack: str(b.pack, 120),
    icon: str(b.icon || existing?.icon || "pill", 40),
    short: str(b.short, 200),
    description: str(b.description, 1200),
    indications: (Array.isArray(b.indications) ? b.indications.map((i: unknown) => str(i, 80)) : String(b.indications || "").split(/\n|,/).map(s => s.trim()))
      .filter(Boolean).slice(0, 12),
    dosage: str(b.dosage, 300),
    mrp: Math.max(0, Math.round(Number(b.mrp) || 0)),
    image: imageOk(image) ? image : undefined,
    sort_order: existing?.sort_order ?? 0
  };
  const errors: Record<string, string> = {};
  if (product.brand.length < 2) errors.brand = "Brand name required";
  if (product.molecule.length < 2) errors.molecule = "Composition required";
  return { product, errors };
}

export function cleanSite(b: any, stored: SiteContent | null): SiteContent {
  const cur: SiteContent = {
    ...SITE_DEFAULTS, ...(stored || {}),
    company: { ...SITE_DEFAULTS.company, ...(stored?.company || {}) },
    contact: { ...SITE_DEFAULTS.contact, ...(stored?.contact || {}), social: { ...SITE_DEFAULTS.contact.social, ...(stored?.contact?.social || {}) } }
  };
  const keep = (v: unknown, n: number, d: string) => (typeof v === "string" ? v.trim().slice(0, n) : d);
  const img = (v: unknown, d: string) => (typeof v === "string" && imageOk(v) ? v : d);
  const url = (v: unknown, d: string) => { const s = keep(v, 300, ""); return s === "" ? "" : /^https?:\/\//i.test(s) ? s : d; };

  return {
    company: {
      name: keep(b.company?.name, 80, cur.company.name),
      tagline: keep(b.company?.tagline, 120, cur.company.tagline),
      blurb: keep(b.company?.blurb, 400, cur.company.blurb)
    },
    contact: {
      phone: keep(b.contact?.phone, 40, cur.contact.phone),
      email: keep(b.contact?.email, 160, cur.contact.email),
      whatsapp: keep(b.contact?.whatsapp, 40, cur.contact.whatsapp),
      address: keep(b.contact?.address, 300, cur.contact.address),
      hours: keep(b.contact?.hours, 120, cur.contact.hours),
      mapQuery: keep(b.contact?.mapQuery, 200, cur.contact.mapQuery),
      social: {
        facebook: url(b.contact?.social?.facebook, cur.contact.social.facebook),
        instagram: url(b.contact?.social?.instagram, cur.contact.social.instagram),
        linkedin: url(b.contact?.social?.linkedin, cur.contact.social.linkedin),
        x: url(b.contact?.social?.x, cur.contact.social.x)
      }
    },
    hero: {
      eyebrow: keep(b.hero?.eyebrow, 120, cur.hero.eyebrow),
      title: keep(b.hero?.title, 200, cur.hero.title),
      sub: keep(b.hero?.sub, 600, cur.hero.sub),
      poster: img(b.hero?.poster, cur.hero.poster)
    },
    divisions: (Array.isArray(b.divisions) ? b.divisions : cur.divisions).slice(0, 3).map((d: any, i: number) => ({
      tag: keep(d.tag, 60, cur.divisions[i]?.tag || ""),
      title: keep(d.title, 120, cur.divisions[i]?.title || ""),
      desc: keep(d.desc, 300, ""),
      image: img(d.image, cur.divisions[i]?.image || ""),
      href: keep(d.href, 200, cur.divisions[i]?.href || "")
    })),
    strip: {
      title1: keep(b.strip?.title1, 60, cur.strip.title1),
      title2: keep(b.strip?.title2, 60, cur.strip.title2),
      sub: keep(b.strip?.sub, 400, cur.strip.sub),
      featured: Array.isArray(b.strip?.featured) ? b.strip.featured.map(slug).filter(Boolean).slice(0, 12) : cur.strip.featured
    }
  };
}
