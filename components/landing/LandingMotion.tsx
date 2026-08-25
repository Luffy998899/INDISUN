"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/** All landing-page choreography. Server components render the markup; this drives it. */
export default function LandingMotion() {
  useEffect(() => {
    const reduce = /[?&]motion=0/.test(location.search) || localStorage.getItem("motion") === "off";
    gsap.registerPlugin(ScrollTrigger);
    const cleanups: Array<() => void> = [];
    const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel);

    /* The landing page is one long pinned/scrubbed timeline — restoring a mid-page scroll
       position on reload drops the visitor into a half-played state, so always start at the top. */
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!location.hash) window.scrollTo(0, 0);

    /* ---------- smooth scroll ---------- */
    let lenis: Lenis | null = null;
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      cleanups.push(() => { gsap.ticker.remove(tick); lenis?.destroy(); });
    }

    /* ---------- hero headline: split into characters ---------- */
    /* Walks text nodes only, so inline markup in the headline (<br>, <em> accents) survives. */
    const splitChars = (root: HTMLElement) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const texts: Text[] = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) texts.push(n as Text);
      for (const node of texts) {
        const frag = document.createDocumentFragment();
        for (const c of node.nodeValue || "") {
          const s = document.createElement("span");
          if (c === " ") s.className = "sp";
          else { s.className = "ch"; s.textContent = c; }
          frag.appendChild(s);
        }
        node.parentNode?.replaceChild(frag, node);
      }
    };

    const h1 = $("#hero-h1");
    if (h1 && !h1.dataset.split) { h1.dataset.split = "1"; splitChars(h1); }

    let heroRevealed = false;
    const revealHero = () => {
      if (!h1 || heroRevealed) return;
      heroRevealed = true;
      const chars = h1.querySelectorAll(".ch");
      if (reduce) { gsap.set(chars, { opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }); return; }
      gsap.to(chars, { opacity: 1, y: 0, rotate: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", stagger: { each: 0.022 } });
      gsap.fromTo(".hero-img", { scale: 1.25 }, { scale: 1.12, duration: 2.2, ease: "power2.out" });
    };
    /* gsap.set writes styles synchronously, so this still lands even if the rAF ticker is
       throttled (backgrounded tab) and the reveal tween never gets a chance to render. */
    const heroFailsafe = setTimeout(() => {
      if (!h1) return;
      const stuck = [...h1.querySelectorAll<HTMLElement>(".ch")].some(c => getComputedStyle(c).opacity === "0");
      if (stuck) gsap.set(h1.querySelectorAll(".ch"), { opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" });
    }, 6000);
    cleanups.push(() => clearTimeout(heroFailsafe));

    /* ---------- preloader ---------- */
    const pre = $("#preloader"), num = $("#pre-num"), fill = $("#pre-fill");
    if (pre && num && fill) {
      document.body.style.overflow = "hidden";
      const start = performance.now(), dur = reduce ? 200 : 1500;
      let done = document.readyState === "complete", finished = false;
      const onLoad = () => { done = true; };
      addEventListener("load", onLoad);
      const finish = () => {
        if (finished) return;
        finished = true;
        clearInterval(iv);
        num.textContent = "100"; fill.style.width = "100%";
        document.body.style.overflow = "";
        /* The scroll lock hid the scrollbar; anything ScrollTrigger measured until now was
           15px too wide, which is what leaks out as horizontal scroll on the pinned section. */
        ScrollTrigger.refresh();
        if (reduce) pre.remove();
        else {
          gsap.timeline({ onComplete: () => pre.remove() })
            .to(".pre-inner", { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" })
            .to(pre, { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "-=0.1");
          setTimeout(() => pre.remove(), 1600);
        }
        revealHero();
      };
      const iv = setInterval(() => {
        const p = Math.min(1, (performance.now() - start) / dur);
        const v = Math.round(p * 100);
        num.textContent = String(v); fill.style.width = v + "%";
        if (p >= 1 && done) finish();
      }, 30);
      const safety = setTimeout(finish, 4000);
      cleanups.push(() => { clearInterval(iv); clearTimeout(safety); removeEventListener("load", onLoad); document.body.style.overflow = ""; });
    } else revealHero();

    if (!reduce) {
      gsap.fromTo(".hero-img", { yPercent: 0 }, { yPercent: 18, ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      /* immediateRender:false keeps the hero copy from snapping to its faded end state
         when ScrollTrigger re-measures the page after the pinned sections settle. */
      gsap.fromTo(".hero-center", { yPercent: 0, opacity: 1 }, { yPercent: -12, opacity: 0, ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });
    }

    /* ---------- hero particles ---------- */
    const cv = $<HTMLCanvasElement>("#particles");
    if (cv && !reduce) {
      const ctx = cv.getContext("2d")!;
      let W = 0, H = 0, raf = 0;
      const resize = () => { W = cv.width = cv.clientWidth * devicePixelRatio; H = cv.height = cv.clientHeight * devicePixelRatio; };
      resize(); addEventListener("resize", resize);
      const parts = Array.from({ length: 34 }, () => ({
        x: Math.random(), y: Math.random(), r: 2 + Math.random() * 10, s: 0.02 + Math.random() * 0.06,
        a: Math.random() * Math.PI * 2, cap: Math.random() < 0.3, rot: Math.random() * Math.PI, d: Math.random()
      }));
      let mx = 0.5, my = 0.5;
      const onMove = (e: PointerEvent) => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; };
      addEventListener("pointermove", onMove, { passive: true });
      let last = performance.now();
      const loop = (now: number) => {
        const dt = Math.min(50, now - last) / 1000; last = now;
        ctx.clearRect(0, 0, W, H);
        for (const p of parts) {
          p.y -= p.s * dt * 0.35; p.a += dt * 0.4;
          if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
          const px = (p.x + Math.sin(p.a) * 0.01 + (mx - 0.5) * 0.03 * p.d) * W;
          const py = (p.y + (my - 0.5) * 0.03 * p.d) * H;
          const r = p.r * devicePixelRatio * (0.6 + p.d);
          ctx.globalAlpha = 0.12 + p.d * 0.35;
          if (p.cap) {
            ctx.save(); ctx.translate(px, py); ctx.rotate(p.rot + p.a * 0.3);
            const g = ctx.createLinearGradient(-r * 2, 0, r * 2, 0);
            g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(0.5, "rgba(255,255,255,.9)");
            g.addColorStop(0.5, "#E3C96A"); g.addColorStop(1, "#B5942A");
            ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-r * 2, -r * 0.8, r * 4, r * 1.6, r); ctx.fill(); ctx.restore();
          } else { ctx.fillStyle = "#F3E7BE"; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill(); }
        }
        ctx.globalAlpha = 1; raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      cleanups.push(() => { cancelAnimationFrame(raf); removeEventListener("resize", resize); removeEventListener("pointermove", onMove); });
    }

    /* ---------- scrub-lit statement ---------- */
    const scrub = $("#scrub");
    if (scrub && !scrub.dataset.split) {
      scrub.dataset.split = "1";
      scrub.innerHTML = (scrub.textContent || "").trim().split(/\s+/).map(w => `<span class="sw">${w}</span>`).join(" ");
      const words = scrub.querySelectorAll(".sw");
      if (reduce) words.forEach(w => w.classList.add("lit"));
      else ScrollTrigger.create({
        trigger: scrub, start: "top 80%", end: "bottom 45%", scrub: true,
        onUpdate: self => { const n = Math.round(self.progress * words.length); words.forEach((w, i) => w.classList.toggle("lit", i < n)); }
      });
    }

    /* ---------- velocity marquee ---------- */
    const mq = $("#mq1");
    if (mq && !reduce) {
      const half = mq.scrollWidth / 2;
      let x = 0, vel = 0;
      const st = ScrollTrigger.create({ onUpdate: self => { vel = self.getVelocity() / 900; } });
      const tick = () => { x -= 0.6 + Math.min(6, Math.abs(vel)); if (x <= -half) x += half; mq.style.transform = `translate3d(${x}px,0,0)`; vel *= 0.92; };
      gsap.ticker.add(tick);
      cleanups.push(() => { gsap.ticker.remove(tick); st.kill(); });
    }

    /* ---------- section reveals ---------- */
    if (!reduce) {
      gsap.utils.toArray<HTMLElement>(".sec-title, .sec-sub, .intro-label, .intro-links, .certs, .work-card, .strip-title, .strip-sub, .how-step, .stories-nav, .faq-item, .cta-title")
        .forEach(el => gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
      gsap.utils.toArray<HTMLElement>(".tilt-in")
        .forEach((el, i) => gsap.fromTo(el, { rotateX: -35, rotateY: i % 2 ? 14 : -14, y: 80, opacity: 0 }, { rotateX: 0, rotateY: 0, y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: i * 0.08, scrollTrigger: { trigger: el, start: "top 85%" } }));
      gsap.utils.toArray<HTMLElement>(".work-media img")
        .forEach(img => gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true } }));
    }

    /* ---------- pinned portfolio words ---------- */
    const stack = $("#pin-stack");
    if (stack) {
      const pws = stack.querySelectorAll(".pw");
      const pds = document.querySelectorAll(".pd");
      const objs = document.querySelectorAll(".pin-obj");
      const set = (i: number) => {
        pws.forEach((w, k) => w.classList.toggle("on", k === i));
        pds.forEach((d, k) => d.classList.toggle("on", k === i));
        objs.forEach((o, k) => gsap.to(o, { opacity: k === i ? 1 : 0, scale: k === i ? 1 : 0.6, rotate: k === i ? 0 : k < i ? 25 : -25, duration: 0.6, ease: "power3.out", overwrite: true }));
      };
      set(0);
      if (!reduce) {
        ScrollTrigger.create({
          /* pinType "transform" keeps the stage in flow — the default fixed pin sizes itself to the
             viewport including the scrollbar, which pushes a stray 15px of horizontal scroll. */
          trigger: ".pin-words", start: "top top", end: "+=" + pws.length * 70 + "%", pin: ".pin-stage", pinType: "transform", scrub: true,
          onUpdate: self => set(Math.min(pws.length - 1, Math.floor(self.progress * pws.length)))
        });
        gsap.to(".pin-visual", { y: -40, ease: "none", scrollTrigger: { trigger: ".pin-words", start: "top top", end: "bottom bottom", scrub: true } });
      }
    }

    /* ---------- horizontal product strip ---------- */
    const track = $("#strip-track");
    if (track) {
      if (reduce) track.parentElement!.style.overflowX = "auto";
      else {
        const dist = () => Math.max(0, track.scrollWidth - track.parentElement!.clientWidth + 40);
        gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: ".strip", start: "top 70%", end: "bottom 20%", scrub: 1, invalidateOnRefresh: true } });
      }
    }

    /* ---------- giant outlined word ---------- */
    if (!reduce) gsap.fromTo("#giant", { yPercent: 40, opacity: 0.2 }, { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".cta-end", start: "top bottom", end: "bottom bottom", scrub: true } });

    /* ---------- background videos only play while visible ---------- */
    const vids = document.querySelectorAll<HTMLVideoElement>("video[data-bg]");
    let vio: IntersectionObserver | null = null;
    if (reduce) vids.forEach(v => { v.removeAttribute("autoplay"); v.pause(); });
    else {
      vio = new IntersectionObserver(entries => entries.forEach(e => {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
      }), { threshold: 0.05 });
      vids.forEach(v => vio!.observe(v));
    }

    ScrollTrigger.refresh();
    const onLoadRefresh = () => ScrollTrigger.refresh();
    addEventListener("load", onLoadRefresh);
    /* Web fonts and the hero artwork change section heights after first paint. */
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    const lateRefresh = setTimeout(() => ScrollTrigger.refresh(), 1200);
    cleanups.push(() => clearTimeout(lateRefresh));

    return () => {
      removeEventListener("load", onLoadRefresh);
      vio?.disconnect();
      ScrollTrigger.getAll().forEach(t => t.kill());
      cleanups.forEach(fn => fn());
    };
  }, []);

  return null;
}
