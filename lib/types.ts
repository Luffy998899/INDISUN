export type Category = "tablets" | "capsules" | "injectables" | "syrups" | "ointments";

export interface Product {
  id: string; brand: string; molecule: string; category: Category; segment: string; pack: string;
  icon: string; short: string; description: string; indications: string[]; dosage: string; mrp: number;
  image?: string; sort_order?: number;
}

export interface Enquiry {
  id: string; createdAt: string; status: "new" | "contacted" | "converted" | "closed"; type: string;
  name: string; email: string; phone: string; territory: string; product: string; message: string;
  note?: string | null; ip?: string | null;
}

export interface Division { tag: string; title: string; desc: string; image: string; href: string }

export interface SiteContent {
  company: { name: string; tagline: string; blurb: string };
  contact: {
    phone: string; email: string; whatsapp: string; address: string; hours: string; mapQuery: string;
    social: { facebook: string; instagram: string; linkedin: string; x: string };
  };
  hero: { eyebrow: string; title: string; sub: string; poster: string };
  divisions: Division[];
  strip: { title1: string; title2: string; sub: string; featured: string[] };
}

export interface AdminUser { id: number; username: string; password_hash: string; last_login?: string | null }
export interface Session { token_hash: string; user_id: number; username: string; expires_at: string }

export const CATEGORIES: Category[] = ["tablets", "capsules", "injectables", "syrups", "ointments"];
export const CATEGORY_LABEL: Record<Category, string> = {
  tablets: "Tablets", capsules: "Capsules", injectables: "Injectables", syrups: "Syrups", ointments: "Ointments"
};
export const CATEGORY_IMAGE: Record<Category, string> = {
  tablets: "/img/cat-tablets.jpg", capsules: "/img/cat-capsules.jpg", injectables: "/img/cat-injectables.jpg",
  syrups: "/img/cat-syrups.jpg", ointments: "/img/cat-ointments.jpg"
};

export const productImage = (p: Pick<Product, "image" | "category">): string =>
  p.image || CATEGORY_IMAGE[p.category] || CATEGORY_IMAGE.tablets;

export const NAV = [
  { href: "/", label: "Home", n: "01" },
  { href: "/about", label: "About", n: "02" },
  { href: "/products", label: "Products", n: "03" },
  { href: "/services", label: "What We Provide", n: "04" },
  { href: "/contact", label: "Contact", n: "05" }
] as const;
