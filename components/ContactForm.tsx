"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = { text: string; tone: "idle" | "error" | "ok" };

export default function ContactForm() {
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>({ text: "", tone: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const product = params.get("product");
    if (product) setMessage(`I'd like to know more about ${product}.`);
  }, [params]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    const next: Record<string, string> = {};
    if ((data.name || "").trim().length < 2) next.name = "Enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "")) next.email = "Enter a valid email";
    if (!/^[+\d][\d\s\-()]{7,19}$/.test(data.phone || "")) next.phone = "Enter a valid phone number";
    setErrors(next);
    if (Object.keys(next).length) { setStatus({ text: Object.values(next)[0] + ".", tone: "error" }); return; }

    setBusy(true); setStatus({ text: "Sending…", tone: "idle" });
    try {
      const r = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        form.reset(); setMessage("");
        setStatus({ text: "Thank you for your message. It has been sent — we'll reply within one business day.", tone: "ok" });
      } else if (j.errors) {
        setErrors(j.errors);
        setStatus({ text: String(Object.values(j.errors)[0]), tone: "error" });
      } else setStatus({ text: j.error || "Something went wrong. Please try again.", tone: "error" });
    } catch {
      setStatus({ text: "Network error — please try again or email us directly.", tone: "error" });
    } finally { setBusy(false); }
  }

  const cls = (n: string) => (errors[n] ? "invalid" : "");

  return (
    <form className="bg-white border border-grey/30 rounded-lg p-6 md:p-8" onSubmit={onSubmit} noValidate>
      <span className="text-gold font-display text-label-bold uppercase tracking-wider mb-2 block">Inquire us</span>
      <h2 className="font-display text-headline-md text-navy mb-6">Send us a message</h2>
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div className="fl"><input className={cls("name")} name="name" type="text" placeholder=" " autoComplete="name" title={errors.name || ""} /><label>Full name *</label></div>
        <div className="fl"><input className={cls("email")} name="email" type="email" placeholder=" " autoComplete="email" title={errors.email || ""} /><label>Email address *</label></div>
        <div className="fl"><input className={cls("phone")} name="phone" type="tel" placeholder=" " autoComplete="tel" title={errors.phone || ""} /><label>Phone / WhatsApp *</label></div>
        <div className="fl"><input name="territory" type="text" placeholder=" " /><label>City / district (optional)</label></div>
      </div>
      <div className="fl mb-6">
        <textarea name="message" rows={5} placeholder=" " value={message} onChange={e => setMessage(e.target.value)} />
        <label>Your message</label>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button className="btn-shine inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-deep disabled:opacity-60 text-white px-8 py-4 rounded font-display font-bold text-label-bold uppercase transition-colors" disabled={busy}>
          Send message <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
        <p className="text-body-sm" style={{ color: status.tone === "error" ? "#B23A3A" : status.tone === "ok" ? "#B5942A" : "#8A8C8F" }} aria-live="polite">{status.text}</p>
      </div>
      <p className="text-caption text-grey mt-4">By submitting you agree to our <a className="underline" href="/privacy">privacy policy</a>.</p>
    </form>
  );
}
