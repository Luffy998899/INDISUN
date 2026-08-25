"use client";

import { useCallback, useEffect, useState } from "react";

const STORIES = [
  { quote: "Monopoly rights for my district made all the difference. Orders dispatch within 48 hours and the visual aids are excellent.", name: "Rajesh Kumar", role: "Franchise Partner, Lucknow" },
  { quote: "Doctors trust the quality. Repeat prescriptions on CLAV-M and PANTO-D grew our revenue 3× in the first year.", name: "Dr. Meena Iyer", role: "Distributor, Coimbatore" },
  { quote: "Transparent pricing, no hidden targets, and a responsive team. Exactly what a new franchisee needs.", name: "Amit Sharma", role: "Franchise Partner, Jaipur" }
];

export default function Stories() {
  const [i, setI] = useState(0);
  const go = useCallback((n: number) => setI(v => (n + STORIES.length + v * 0) % STORIES.length), []);
  const next = useCallback(() => setI(v => (v + 1) % STORIES.length), []);
  const prev = useCallback(() => setI(v => (v - 1 + STORIES.length) % STORIES.length), []);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, i]);

  void go;
  return (
    <section className="stories light">
      <div className="container-x stories-grid">
        <div>
          <h2 className="sec-title">Partner stories</h2>
          <p className="sec-sub">What our franchisees say after a year with Indisun.</p>
          <div className="stories-nav">
            <button className="nav-btn" onClick={prev} aria-label="Previous story"><span className="material-symbols-outlined">arrow_back</span></button>
            <button className="nav-btn" onClick={next} aria-label="Next story"><span className="material-symbols-outlined">arrow_forward</span></button>
          </div>
        </div>
        <div className="stories-track">
          {STORIES.map((s, k) => (
            <blockquote key={s.name} className={`story ${k === i ? "is-active" : ""}`} aria-hidden={k !== i}>
              <p>&ldquo;{s.quote}&rdquo;</p>
              <footer><b>{s.name}</b><span>{s.role}</span></footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
