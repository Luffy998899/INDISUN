import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] grid place-items-center text-center px-5 py-40">
      <div>
        <h1 className="font-display font-bold text-[clamp(48px,10vw,120px)] leading-none text-gold">404</h1>
        <p className="text-white/70 mt-2">That page doesn&apos;t exist.</p>
        <Link className="btn-shine inline-block mt-6 px-7 py-4 rounded-full bg-gold text-white font-display font-semibold text-body-sm" href="/">
          Back to home
        </Link>
      </div>
    </main>
  );
}
