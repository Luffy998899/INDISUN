"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, CATEGORY_LABEL, productImage, type Category, type Product } from "@/lib/types";

type Sort = "brand" | "segment" | "mrp-asc" | "mrp-desc";
const CHIPS: (Category | "all")[] = ["all", ...CATEGORIES];

export default function ProductBrowser({ products }: { products: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [cat, setCat] = useState<Category | "all">((params.get("cat") as Category) || "all");
  const [q, setQ] = useState(params.get("q") || "");
  const [sort, setSort] = useState<Sort>("brand");

  const sync = (nextCat: string, nextQ: string) => {
    const sp = new URLSearchParams();
    if (nextCat !== "all") sp.set("cat", nextCat);
    if (nextQ) sp.set("q", nextQ);
    router.replace(sp.toString() ? `/products?${sp}` : "/products", { scroll: false });
  };

  const list = useMemo(() => {
    let out = products.filter(p => cat === "all" || p.category === cat);
    const s = q.trim().toLowerCase();
    if (s) out = out.filter(p => [p.brand, p.molecule, p.segment].join(" ").toLowerCase().includes(s));
    return [...out].sort((a, b) =>
      sort === "mrp-asc" ? a.mrp - b.mrp
        : sort === "mrp-desc" ? b.mrp - a.mrp
        : sort === "segment" ? a.segment.localeCompare(b.segment) || a.brand.localeCompare(b.brand)
        : a.brand.localeCompare(b.brand));
  }, [products, cat, q, sort]);

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-grey">search</span>
          <input
            type="search" value={q} placeholder="Search by brand, molecule or segment…"
            onChange={e => { setQ(e.target.value); sync(cat, e.target.value); }}
            className="w-full pl-11 pr-4 py-3 bg-white border border-grey rounded text-navy focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
          />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="bg-white border border-grey rounded py-3 px-4 text-navy outline-none focus:border-gold">
          <option value="brand">Sort: Brand A–Z</option>
          <option value="segment">Sort: Segment</option>
          <option value="mrp-asc">Sort: MRP low → high</option>
          <option value="mrp-desc">Sort: MRP high → low</option>
        </select>
        <a href="/api/products.csv" className="btn-shine inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-deep text-white px-6 py-3 rounded font-display font-bold text-label-bold uppercase transition-colors">
          <span className="material-symbols-outlined text-[20px]">download</span> Download product list
        </a>
      </div>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 mb-6">
        {CHIPS.map(k => (
          <button
            key={k}
            onClick={() => { setCat(k); sync(k, q); }}
            className={`shrink-0 px-4 py-2 rounded border border-gold font-display font-semibold text-body-sm transition-colors ${cat === k ? "bg-gold text-white" : "text-gold hover:bg-gold/10"}`}
          >
            {k === "all" ? "All Products" : CATEGORY_LABEL[k]}{" "}
            <span className="opacity-70">({k === "all" ? products.length : products.filter(p => p.category === k).length})</span>
          </button>
        ))}
      </div>

      <p className="text-body-sm text-ink mb-6">
        {list.length} product{list.length === 1 ? "" : "s"}
        {cat !== "all" ? ` in ${CATEGORY_LABEL[cat]}` : ""}
        {q ? ` matching “${q}”` : ""}
      </p>

      {list.length === 0 ? (
        <div className="text-center py-16 text-ink">
          <span className="material-symbols-outlined text-[48px] mb-2 block">search_off</span>
          No products match your search. <Link className="text-gold underline" href="/contact">Ask us about it</Link>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {list.map(p => (
            <article key={p.id} className="product-card glow-card bg-white rounded-lg overflow-hidden flex flex-col">
              <Link href={`/products/${encodeURIComponent(p.id)}`} className="h-44 bg-ivory-dark flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productImage(p)} alt={p.brand} className="w-full h-full object-cover" loading="lazy" />
              </Link>
              <div className="p-5 flex flex-col flex-1 text-navy">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block text-caption uppercase tracking-wider text-white bg-blue px-2 py-1 rounded-sm">{p.segment}</span>
                  <span className="text-caption text-ink">MRP ₹{p.mrp}</span>
                </div>
                <p className="font-display text-label-bold uppercase text-grey mb-1 clip-1">{p.molecule}</p>
                <h3 className="font-display text-headline-md mb-2">{p.brand}</h3>
                <p className="text-body-sm text-ink mb-4">{p.short}</p>
                <p className="text-caption text-grey mb-4 mt-auto">Pack: {p.pack}</p>
                <div className="flex gap-2">
                  <Link className="flex-1 text-center border border-gold text-gold hover:bg-gold hover:text-white px-3 py-2 rounded font-display font-bold text-body-sm transition-colors" href={`/products/${encodeURIComponent(p.id)}`}>View details</Link>
                  <Link className="flex-1 text-center bg-gold hover:bg-gold-deep text-white px-3 py-2 rounded font-display font-bold text-body-sm transition-colors" href={`/contact?product=${encodeURIComponent(p.brand)}`}>Enquire</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
