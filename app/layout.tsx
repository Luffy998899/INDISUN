import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-space-grotesk", display: "swap" });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Indisun Life Sciences — PCD Pharma Franchise", template: "%s — Indisun Life Sciences" },
  description: "Indisun Life Sciences — WHO-GMP certified PCD pharma franchise partner. Heal · Hope · Happiness. 500+ formulations, monopoly rights, marketing support, pan-India delivery.",
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
