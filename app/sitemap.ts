import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const BASE = process.env.SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, priority: 1 },
    { url: `${BASE}/about`, priority: 0.8 },
    { url: `${BASE}/products`, priority: 0.8 },
    { url: `${BASE}/services`, priority: 0.8 },
    { url: `${BASE}/contact`, priority: 0.8 },
    { url: `${BASE}/privacy`, priority: 0.3 },
    { url: `${BASE}/terms`, priority: 0.3 }
  ];
  try {
    const products = await (await db()).listProducts();
    return pages.concat(products.map(p => ({ url: `${BASE}/products/${encodeURIComponent(p.id)}`, priority: 0.6 })));
  } catch { return pages; }
}
