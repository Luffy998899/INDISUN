"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, type SiteContent } from "@/lib/types";
import { LogoMark, LogoWord } from "./Logo";

export default function Header({ contact }: { contact: SiteContent["contact"] }) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (href: string) => {
    const p = pathname.replace(/\/+$/, "") || "/";
    return href === "/" ? p === "/" : p === href || p.startsWith(href + "/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className={`site-bar fixed top-0 inset-x-0 z-70 ${scrolled ? "scrolled" : ""}`}>
        <div className="flex items-center justify-between px-5 md:px-10 h-[72px] gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Indisun Life Sciences home">
            <LogoMark size={38} /><LogoWord />
          </Link>
          <nav className="site-nav hidden lg:flex items-center gap-7" aria-label="Primary">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} className={isActive(n.href) ? "is-active" : ""}>{n.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Link href="/contact" className="pill pill-talk"><span className="pill-dot" />Let&apos;s talk</Link>
            <button className="pill nav-toggle" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
              <span className="burger"><i /><i /></span><span>Menu</span>
            </button>
          </div>
        </div>
      </header>

      <div className={`overlay fixed inset-0 z-80 ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="overlay-bg absolute inset-0 bg-navy" />
        <div className="ov-rays absolute inset-0 pointer-events-none" />
        <div className="relative h-full flex flex-col px-5 md:px-10">
          <div className="flex items-center justify-between h-[72px]">
            <Link href="/" className="flex items-center gap-2.5"><LogoMark size={38} /><LogoWord /></Link>
            <button className="pill is-open" onClick={() => setOpen(false)} aria-label="Close menu">
              <span className="burger"><i /><i /></span><span>Close</span>
            </button>
          </div>
          <nav className="flex-1 flex flex-col justify-center gap-2 py-8">
            {NAV.map((n, i) => (
              <Link key={n.href} href={n.href} className="ov-link group flex items-baseline gap-5" style={{ "--i": i } as React.CSSProperties}>
                <span className="font-display text-caption text-gold tracking-[0.2em]">{n.n}</span>
                <span className={`font-display font-bold text-[30px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] transition-colors group-hover:text-gold ${isActive(n.href) ? "text-gold" : "text-white"}`}>{n.label}</span>
              </Link>
            ))}
          </nav>
          <div className="ov-meta grid sm:grid-cols-3 gap-6 pb-8 text-body-sm text-white/70">
            <div>
              <p className="text-caption uppercase tracking-[0.2em] text-gold mb-2">Call</p>
              <a className="hover:text-white" href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>{contact.phone}</a>
            </div>
            <div>
              <p className="text-caption uppercase tracking-[0.2em] text-gold mb-2">Email</p>
              <a className="hover:text-white break-all" href={`mailto:${contact.email}`}>{contact.email}</a>
            </div>
            <div>
              <p className="text-caption uppercase tracking-[0.2em] text-gold mb-2">Office</p>
              <p className="whitespace-pre-line">{contact.address}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
