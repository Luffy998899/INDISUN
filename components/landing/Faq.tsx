"use client";

import { useRef } from "react";

const FAQS = [
  ["What is the minimum investment to start?", "A starter order of ₹25,000–₹50,000 is typical. There are no franchise fees or security deposits."],
  ["Which documents are required?", "A valid wholesale Drug Licence and GST registration. We guide you through obtaining both."],
  ["Is the monopoly really exclusive?", "Yes — territory rights are written into the agreement and we never appoint a second partner in the same area."],
  ["Can I get products under my own brand?", "Yes, third-party manufacturing with your artwork is available subject to minimum batch quantities."],
  ["How fast do orders ship?", "Packed and QC-released within 24 hours, dispatched within 48, delivered pan-India in 3–7 days."]
];

export default function Faq() {
  const wrap = useRef<HTMLDivElement>(null);
  // keep only one answer open at a time
  const onToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const el = e.currentTarget;
    if (!el.open) return;
    wrap.current?.querySelectorAll<HTMLDetailsElement>("details").forEach(d => { if (d !== el) d.open = false; });
  };
  return (
    <section className="faq" id="faq">
      <div className="container-x faq-grid">
        <div>
          <h2 className="sec-title">Questions</h2>
          <p className="sec-sub">Everything a new partner usually asks before starting.</p>
        </div>
        <div className="faq-list" ref={wrap}>
          {FAQS.map(([q, a]) => (
            <details key={q} className="faq-item" onToggle={onToggle}>
              <summary>{q}<i className="material-symbols-outlined">add</i></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
