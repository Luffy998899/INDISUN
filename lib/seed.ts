import type { SiteContent } from "./types";

export const SITE_DEFAULTS: SiteContent = {
  company: {
    name: "Indisun Life Sciences",
    tagline: "Heal · Hope · Happiness",
    blurb: "Blending scientific rigor with entrepreneurial energy to deliver reliable PCD Pharma solutions and empowering franchise opportunities."
  },
  contact: {
    phone: "+91 99887 57989",
    email: "info@indisunlifesciences.com",
    whatsapp: "+91 99887 57989",
    address: "Industrial Area, Phase-1,\nPanchkula, Haryana, India",
    hours: "Mon – Sat, 9:30 AM – 6:30 PM IST",
    mapQuery: "Industrial Area Phase 1 Panchkula Haryana",
    social: { facebook: "", instagram: "", linkedin: "", x: "" }
  },
  hero: {
    eyebrow: "PCD Pharma Franchise · WHO-GMP Certified",
    title: "Medicines designed<br/>to mean something.",
    sub: "Indisun Life Sciences is an independent life-sciences company crafting trusted formulations through quality, science and partnership — for the doctors who prescribe them and the partners who deliver them.",
    poster: "/img/hero-canva.jpg"
  },
  divisions: [
    { tag: "Doctor-trusted", title: "Formulations doctors prescribe with confidence.", desc: "Every molecule is chosen for clinical relevance, dosed to pharmacopoeial standards and packed for compliance — so prescriptions repeat.", image: "/img/doctor.jpg", href: "/about" },
    { tag: "Science-led", title: "A medical team behind every batch.", desc: "", image: "/img/team.jpg", href: "/services#quality" },
    { tag: "WHO-GMP", title: "Made in certified cleanrooms.", desc: "", image: "/img/cleanroom.jpg", href: "/services#quality" }
  ],
  strip: {
    title1: "Trusted formulations,",
    title2: "delivered with care",
    sub: "Every Indisun product is manufactured in WHO-GMP certified facilities and reaches our partners across India within days — packed, QC-released and tracked.",
    featured: ["clav-m-625", "panto-d", "dexa-c", "sun-vit", "panto-iv", "clotri-b", "azi-500", "para-kid"]
  }
};
