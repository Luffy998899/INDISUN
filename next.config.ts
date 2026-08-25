import type { NextConfig } from "next";

const PROD = process.env.NODE_ENV === "production";
const supabaseHost = (() => {
  try { return process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : ""; } catch { return ""; }
})();

/** Content-Security-Policy. `unsafe-inline` is required for Next's hydration/bootstrap scripts. */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${PROD ? "" : " 'unsafe-eval'"} https://cdn.jsdelivr.net`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "frame-src https://www.google.com",
  `connect-src 'self' https://cdn.jsdelivr.net${supabaseHost ? " " + supabaseHost : ""}`,
  "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
  ...(PROD ? ["upgrade-insecure-requests"] : [])
].join("; ");

const nextConfig: NextConfig = {
  // native / Node-only packages must not be bundled by Turbopack
  serverExternalPackages: ["better-sqlite3", "mysql2", "bcryptjs"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          ...(PROD ? [{ key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains" }] : [])
        ]
      },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }
    ];
  },
  async redirects() {
    // permanent redirects from the previous .html URLs
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/products.html", destination: "/products", permanent: true },
      { source: "/services.html", destination: "/services", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/privacy.html", destination: "/privacy", permanent: true },
      { source: "/terms.html", destination: "/terms", permanent: true },
      { source: "/admin.html", destination: "/admin", permanent: true },
      { source: "/product.html", has: [{ type: "query", key: "id", value: "(?<pid>.*)" }], destination: "/products/:pid", permanent: true },
      { source: "/product.html", destination: "/products", permanent: true }
    ];
  }
};

export default nextConfig;
