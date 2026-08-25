import Link from "next/link";
import "./landing.css";
import { db } from "@/lib/db";
import { SITE_DEFAULTS } from "@/lib/seed";
import { PRODUCT_SEED } from "@/lib/products-seed";
import { CATEGORY_LABEL, productImage, type Product, type SiteContent } from "@/lib/types";
import LandingMotion from "@/components/landing/LandingMotion";
import Stories from "@/components/landing/Stories";
import Faq from "@/components/landing/Faq";

export const dynamic = "force-dynamic";

const PORTFOLIO = [
  { key: "tablets", word: "Tablets", img: "/img/cat-tablets.jpg", desc: "Antibiotics, analgesics, anti-diabetics and supplements in Alu-Alu and blister packs." },
  { key: "capsules", word: "Capsules", img: "/img/cat-capsules.jpg", desc: "Sustained-release PPIs, softgel multivitamins and chronic-care capsules." },
  { key: "injectables", word: "Injectables", img: "/img/cat-injectables.jpg", desc: "Lyophilised and aqueous injectables for hospitals and critical care." },
  { key: "syrups", word: "Syrups", img: "/img/cat-syrups.jpg", desc: "Cough, paediatric and haematinic syrups with pleasant-taste bases." },
  { key: "ointments", word: "Ointments", img: "/img/cat-ointments.jpg", desc: "Antifungal, antibiotic and analgesic topicals in 5–30 g tubes." }
];

const HERO_STATS: ReadonlyArray<readonly [string, string]> = [
  ["500+", "Formulations"],
  ["1200+", "Franchise partners"],
  ["48 hrs", "Dispatch window"],
  ["WHO-GMP", "Certified plants"]
];

const STEPS = [
  ["Step 01", "Enquire", "Share your territory and the therapeutic segments you want to focus on."],
  ["Step 02", "Territory check", "We confirm monopoly availability and share the price list and policy."],
  ["Step 03", "Agreement", "Sign the franchise agreement and receive your promotional kit."],
  ["Step 04", "Launch", "Your first order ships within 48 hours with live tracking."]
];

async function getData(): Promise<{ site: SiteContent; products: Product[] }> {
  try {
    const a = await db();
    const [site, products] = await Promise.all([a.getSite(), a.listProducts()]);
    return { site: site || SITE_DEFAULTS, products };
  } catch {
    return { site: SITE_DEFAULTS, products: PRODUCT_SEED };
  }
}

export default async function Home() {
  const { site, products } = await getData();
  const featured = site.strip.featured
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => !!p);
  const strip = featured.length >= 4 ? featured : featured.concat(products.filter(p => !featured.includes(p)).slice(0, 8 - featured.length));
  // Everything after the line break is the gold accent half of the headline.
  const heroTitle = site.hero.title.replace(/(<br\s*\/?>)([\s\S]+)$/i, "$1<em>$2</em>");
  // The shipped backdrop has a hand-made small variant; uploads are served at one size.
  const heroSrcSet = site.hero.poster === "/img/hero-canva.jpg" ? "/img/hero-canva-sm.jpg 1280w, /img/hero-canva.jpg 2560w" : undefined;

  return (
    <main>
      <LandingMotion />

      {/* Preloader */}
      <div className="preloader" id="preloader" aria-hidden>
        <div className="pre-inner">
          <div className="pre-logo">
            <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
              <g fill="#B5942A" className="pre-paths">
                <path d="M31 4h2l1 20h-4z" /><path d="M22 7l2-1 6 18-3 1z" /><path d="M42 7l-2-1-6 18 3 1z" />
                <path d="M13 13l2-2 11 14-2 2z" /><path d="M51 13l-2-2-11 14 2 2z" />
                <path d="M6 26c10-2 18 1 23 9-9 2-17-1-23-9z" /><path d="M58 26c-10-2-18 1-23 9 9 2 17-1 23-9z" />
                <circle cx="32" cy="36" r="3.4" />
                <path d="M23 38c3 3 6 4 8 4v18h2V42c2 0 5-1 8-4-4 1-7 2-9 2s-5-1-9-2z" />
              </g>
            </svg>
          </div>
          <div className="pre-words"><span>Heal</span><span>Hope</span><span>Happiness</span></div>
          <div className="pre-count"><span id="pre-num">0</span>%</div>
        </div>
        <div className="pre-bar"><i id="pre-fill" /></div>
      </div>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hero-img" src={site.hero.poster} srcSet={heroSrcSet} sizes="100vw" alt="" fetchPriority="high" aria-hidden />
          <video className="hero-vid" data-bg autoPlay muted loop playsInline preload="metadata" aria-hidden>
            <source src="/img/hero-loop.mp4" type="video/mp4" media="(min-width: 768px)" />
            <source src="/img/hero-loop-sm.mp4" type="video/mp4" />
          </video>
          <canvas id="particles" className="hero-particles" aria-hidden />
          <div className="hero-vignette" />
          <div className="hero-topfade" />
        </div>
        <div className="hero-grid px-5 md:px-10">
          <div className="hero-center">
            <p className="eyebrow hero-eyebrow"><span className="eyebrow-dot" />{site.hero.eyebrow}</p>
            <h1 className="hero-h1" id="hero-h1" dangerouslySetInnerHTML={{ __html: heroTitle }} />
            <div className="hero-rule" />
            <p className="hero-sub">{site.hero.sub}</p>
            <div className="hero-ctas">
              <Link className="cta-main" href="/contact" data-cursor="Go"><span>Contact us</span><i className="material-symbols-outlined">north_east</i></Link>
              <Link className="cta-ghost" href="/products"><span>Explore products</span></Link>
            </div>
          </div>
          <div className="hero-bottom">
            <ul className="hero-stats">
              {HERO_STATS.map(([n, label]) => <li key={label}><b>{n}</b><span>{label}</span></li>)}
            </ul>
            <a className="hero-scroll" href="#intro"><span>Scroll to explore</span><i className="material-symbols-outlined">arrow_downward</i></a>
          </div>
        </div>
      </section>

      {/* Statement */}
      <section className="intro" id="intro">
        <div className="container-x">
          <p className="intro-label">About Indisun</p>
          <p className="scrub-text" id="scrub">
            Indisun is an independent pharmaceutical company building trusted brands through strategy, science and uncompromising quality. We exist to heal, to give hope, and to bring happiness — to patients, to practitioners, and to the franchise partners who grow with us.
          </p>
          <div className="intro-links">
            <Link className="link-arrow" href="/about">Our story <i className="material-symbols-outlined">north_east</i></Link>
            <Link className="link-arrow" href="/services">What we provide <i className="material-symbols-outlined">north_east</i></Link>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-x" aria-hidden>
        <div className="marquee-x-track" id="mq1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="contents">
              <span>Heal</span><em>+</em><span className="gold">Hope</span><em>+</em><span>Happiness</span><em>+</em>
            </span>
          ))}
        </div>
      </div>

      {/* Key facts */}
      <section className="facts light" id="facts">
        <div className="container-x">
          <div className="sec-head">
            <h2 className="sec-title">Key facts</h2>
            <p className="sec-sub">Numbers that describe the scale of our network and the trust we&apos;ve earned.</p>
          </div>
          <div className="facts-grid">
            {([["500", "+", "Formulations manufactured"], ["1200", "+", "Franchise partners"], ["50", "+", "Markets served"], ["98", "%", "Partner retention"]] as const).map(([n, suffix, label]) => (
              <div className="fact-card tilt-in" key={label}>
                <span className="fact-num"><b data-count={n} data-suffix={suffix}>0</b></span>
                <span className="fact-label">{label}</span>
              </div>
            ))}
          </div>
          <div className="certs">
            <p className="certs-label">Certified &amp; compliant</p>
            <ul className="certs-list">
              {["WHO-GMP", "ISO 9001:2015", "CDSCO", "DCGI Approved", "FSSAI", "GLP"].map(c => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* Built around the prescriber */}
      <section className="work light" id="work">
        <div className="container-x">
          <div className="sec-head row">
            <h2 className="sec-title">Built around the prescriber</h2>
            <Link className="link-arrow" href="/about">Why doctors choose us <i className="material-symbols-outlined">north_east</i></Link>
          </div>
          <div className="work-grid">
            {site.divisions.map((d, i) => (
              <Link key={d.tag} className={`work-card ${i === 0 ? "big" : ""}`} href={d.href || "/about"} data-cursor="View">
                <div className="work-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.image} alt={d.title} loading="lazy" />
                </div>
                <div className="work-meta">
                  <span className="work-tag">{d.tag}</span>
                  <h3>{d.title}</h3>
                  {d.desc && <p>{d.desc}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pinned portfolio */}
      <section className="pin-words" id="pin">
        <div className="pin-stage">
          <video className="smoke-video" data-bg autoPlay muted loop playsInline preload="none" aria-hidden>
            <source src="/img/portfolio-smoke-loop.mp4" type="video/mp4" media="(min-width: 768px)" />
            <source src="/img/portfolio-smoke-loop-sm.mp4" type="video/mp4" />
          </video>
          <div className="smoke-grad" />
          <div className="pin-visual">
            {PORTFOLIO.map(p => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <div className="pin-obj" key={p.key}><img src={p.img} alt={p.word} loading="lazy" /></div>
            ))}
          </div>
          <div className="pin-text">
            <p className="pin-label">Our portfolio</p>
            <h2 className="pin-words-stack" id="pin-stack">
              {PORTFOLIO.map(p => <span className="pw" key={p.key}>{p.word}</span>)}
            </h2>
            <div className="pin-desc">
              {PORTFOLIO.map(p => <p className="pd" key={p.key}>{p.desc}</p>)}
            </div>
          </div>
          <p className="pin-foot">— Different disciplines, one standard of care</p>
        </div>
      </section>

      {/* How we work */}
      <section className="how light" id="how">
        <div className="container-x">
          <div className="sec-head">
            <h2 className="sec-title">How we work</h2>
            <p className="sec-sub">From first enquiry to first dispatch, in four transparent steps.</p>
          </div>
          <ol className="how-steps">
            {STEPS.map(([n, title, body]) => (
              <li className="how-step" key={n}>
                <span className="how-n">{n}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Product strip */}
      <section className="strip" id="motion">
        <div className="container-x strip-head">
          <div>
            <p className="intro-label">Our products</p>
            <h2 className="strip-title">
              <span className="text-white">{site.strip.title1}</span>
              <span className="text-gold">{site.strip.title2}</span>
            </h2>
          </div>
          <p className="strip-sub">{site.strip.sub}</p>
        </div>
        <div className="strip-viewport">
          <div className="strip-track" id="strip-track">
            {strip.map(p => (
              <Link className="sp-card" key={p.id} href={`/products/${encodeURIComponent(p.id)}`} data-cursor="View">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="sp-media"><img src={productImage(p)} alt={p.brand} loading="lazy" /></div>
                <div className="sp-body">
                  <span className="sp-tag">{p.segment} · {CATEGORY_LABEL[p.category]}</span>
                  <h3>{p.brand}</h3>
                  <p className="clip-2">{p.molecule}</p>
                </div>
              </Link>
            ))}
            <Link className="sp-more" href="/products">All products <i className="material-symbols-outlined">north_east</i></Link>
          </div>
        </div>
        <div className="container-x strip-foot">
          <Link className="link-arrow" href="/products">Browse the full catalogue <i className="material-symbols-outlined">north_east</i></Link>
          <span className="strip-hint"><i className="material-symbols-outlined">swipe</i> Scroll to explore</span>
        </div>
      </section>

      <Stories />
      <Faq />

      {/* CTA finale */}
      <section className="cta-end" id="contact">
        <video className="cta-video" data-bg autoPlay muted loop playsInline preload="none" aria-hidden>
          <source src="/img/cta-loop.mp4" type="video/mp4" media="(min-width: 768px)" />
          <source src="/img/cta-loop-sm.mp4" type="video/mp4" />
        </video>
        <div className="cta-grad" />
        <div className="container-x cta-grid">
          <div>
            <p className="intro-label">Let&apos;s build what matters</p>
            <h2 className="cta-title">Ready to grow<br />something bold?</h2>
            <Link className="cta-main" href="/contact" data-cursor="Go"><span>Contact us</span><i className="material-symbols-outlined">north_east</i></Link>
          </div>
          <div className="cta-meta">
            <div><p className="cta-k">Call</p><a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`}>{site.contact.phone}</a></div>
            <div><p className="cta-k">Email</p><a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></div>
            <div><p className="cta-k">Office</p><p className="whitespace-pre-line">{site.contact.address}</p></div>
            <div><p className="cta-k">Hours</p><p>{site.contact.hours}</p></div>
          </div>
        </div>
        <div className="giant-word giant-word-x" id="giant">INDISUN</div>
        <div className="container-x foot-bar">
          <p>© {new Date().getFullYear()} {site.company.name}. {site.company.tagline}</p>
          <div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
        </div>
      </section>
    </main>
  );
}
