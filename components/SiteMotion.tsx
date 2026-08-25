"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Site-wide motion: scroll reveals, count-ups, custom cursor. Re-runs on route change. */
export default function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = /[?&]motion=0/.test(location.search) || localStorage.getItem("motion") === "off";
    if (reduce) document.documentElement.classList.add("no-motion");

    // staggered scroll reveals
    document.querySelectorAll<HTMLElement>(".stagger").forEach(c =>
      Array.from(c.children).forEach((ch, i) => (ch as HTMLElement).style.setProperty("--i", String(i)))
    );
    const targets = document.querySelectorAll<HTMLElement>(".reveal:not(.in), .how-step:not(.in)");
    let io: IntersectionObserver | null = null;
    if (reduce || !("IntersectionObserver" in window)) targets.forEach(e => e.classList.add("in"));
    else {
      io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); io!.unobserve(e.target); }
      }), { threshold: 0.1 });
      targets.forEach(e => io!.observe(e));
    }

    // count-up numbers
    const counters = document.querySelectorAll<HTMLElement>("[data-count]:not(.done)");
    const run = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.count || "0"), suffix = el.dataset.suffix || "", dur = 1400, t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("en-IN") + suffix;
        if (p < 1) requestAnimationFrame(step); else el.classList.add("done");
      };
      requestAnimationFrame(step);
    };
    let cio: IntersectionObserver | null = null;
    if (reduce || !("IntersectionObserver" in window)) counters.forEach(run);
    else {
      cio = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { run(e.target as HTMLElement); cio!.unobserve(e.target); }
      }), { threshold: 0.4 });
      counters.forEach(e => cio!.observe(e));
    }

    return () => { io?.disconnect(); cio?.disconnect(); };
  }, [pathname]);

  // custom cursor (mounted once)
  useEffect(() => {
    const reduce = /[?&]motion=0/.test(location.search) || localStorage.getItem("motion") === "off";
    if (reduce || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    const c = document.createElement("div");
    c.className = "cursor"; c.setAttribute("aria-hidden", "true");
    c.appendChild(document.createElement("span"));
    document.body.appendChild(c);

    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
    const move = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; c.classList.add("on"); };
    const loop = () => { x += (tx - x) * 0.18; y += (ty - y) * 0.18; c.style.transform = `translate(${x}px, ${y}px)`; raf = requestAnimationFrame(loop); };
    const over = (e: Event) => {
      const t = e.target as Element;
      c.classList.toggle("hover", !!t.closest?.("a, button, [data-cursor]"));
      const labelled = t.closest?.("[data-cursor]") as HTMLElement | null;
      if (labelled) { c.dataset.label = labelled.dataset.cursor; c.classList.add("label"); }
      else c.classList.remove("label");
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerover", over);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener("pointermove", move); removeEventListener("pointerover", over); c.remove(); };
  }, []);

  return null;
}
