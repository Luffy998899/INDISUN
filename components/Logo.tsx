export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden className={`shrink-0 ${className}`}>
      <g fill="#B5942A">
        <path d="M31 4h2l1 20h-4z" /><path d="M22 7l2-1 6 18-3 1z" /><path d="M42 7l-2-1-6 18 3 1z" />
        <path d="M13 13l2-2 11 14-2 2z" /><path d="M51 13l-2-2-11 14 2 2z" />
        <path d="M6 26c10-2 18 1 23 9-9 2-17-1-23-9z" /><path d="M58 26c-10-2-18 1-23 9 9 2 17-1 23-9z" />
        <circle cx="32" cy="36" r="3.4" />
        <path d="M23 38c3 3 6 4 8 4v18h2V42c2 0 5-1 8-4-4 1-7 2-9 2s-5-1-9-2z" />
      </g>
    </svg>
  );
}

export function LogoWord({ light = true }: { light?: boolean }) {
  return (
    <span className="flex flex-col leading-none">
      <span className={`logo-word text-[18px] ${light ? "text-white" : "text-blue"}`}>INDISUN</span>
      <span className={`logo-sub mt-1 ${light ? "text-white/70" : "text-ink"}`}>LIFE SCIENCES</span>
    </span>
  );
}
