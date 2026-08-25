import Link from "next/link";
import { NAV, CATEGORIES, type SiteContent } from "@/lib/types";
import { LogoMark, LogoWord } from "./Logo";

export default function Footer({ site }: { site: SiteContent }) {
  const { company, contact } = site;
  const socials: [string, string][] = [
    ["Facebook", contact.social.facebook], ["Instagram", contact.social.instagram],
    ["LinkedIn", contact.social.linkedin], ["X", contact.social.x]
  ];
  return (
    <footer className="bg-navy text-white/80 relative overflow-hidden">
      <div className="container-x py-16 grid grid-cols-1 md:grid-cols-12 gap-gutter relative z-10">
        <div className="md:col-span-5">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3"><LogoMark size={44} /><LogoWord /></Link>
          <p className="font-display text-label-bold uppercase tracking-[0.2em] text-gold mb-3">{company.tagline}</p>
          <p className="text-body-sm text-white/60 max-w-sm mb-5">{company.blurb}</p>
          <div className="flex gap-4 text-body-sm">
            {socials.filter(([, url]) => url).map(([label, url]) => (
              <a key={label} className="text-white/70 hover:text-white" href={url} target="_blank" rel="noopener noreferrer">{label}</a>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-display text-caption uppercase tracking-[0.2em] text-gold mb-4">Company</h4>
          <ul className="space-y-2 text-body-sm">
            {NAV.slice(1).map(n => <li key={n.href}><Link className="hover:text-white" href={n.href}>{n.label}</Link></li>)}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-display text-caption uppercase tracking-[0.2em] text-gold mb-4">Products</h4>
          <ul className="space-y-2 text-body-sm">
            {CATEGORIES.map(c => <li key={c}><Link className="hover:text-white capitalize" href={`/products?cat=${c}`}>{c}</Link></li>)}
          </ul>
        </div>
        <div className="md:col-span-3">
          <h4 className="font-display text-caption uppercase tracking-[0.2em] text-gold mb-4">Contact</h4>
          <ul className="space-y-2 text-body-sm">
            <li><a className="hover:text-white" href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>{contact.phone}</a></li>
            <li><a className="hover:text-white break-all" href={`mailto:${contact.email}`}>{contact.email}</a></li>
            <li className="whitespace-pre-line">{contact.address}</li>
            <li className="text-white/60">{contact.hours}</li>
          </ul>
        </div>
      </div>
      <div className="giant-word" aria-hidden>INDISUN</div>
      <div className="border-t border-white/10 relative z-10">
        <div className="container-x py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-caption text-white/50">
          <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link className="hover:text-white" href="/privacy">Privacy</Link>
            <Link className="hover:text-white" href="/terms">Terms</Link>
            <span>ISO 9001 · WHO-GMP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
