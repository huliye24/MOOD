import type { Metadata } from "next";
import "./globals.css";
import "./mood-world.css";
import "./mood-home-overrides.css";
import "./mood-phase.css";
import "./protocol.css";
import SwRegister from "./sw-register";

export const metadata: Metadata = {
  title: "MOOD | Open Coordination Protocol for Human and Machine Agency",
  description: "MOOD is an open coordination protocol connecting humans, AI agents, organizations and resources through identity, contribution, proof, reputation and settlement.",
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "https://crestwavecoin.com/" },
  openGraph: {
    title: "MOOD | Open Coordination Protocol for Human and Machine Agency",
    description: "An open coordination protocol and digital world for humans, AI agents, organizations and resources.",
    url: "https://crestwavecoin.com/",
    siteName: "MOOD",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://crestwavecoin.com/og.png", width: 1792, height: 896, alt: "MOOD · WORLD · PROTOCOL · PORTAL" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MOOD | Open Coordination Protocol for Human and Machine Agency",
    description: "An open coordination protocol and digital world for humans, AI agents, organizations and resources.",
    images: ["https://crestwavecoin.com/og.png"],
  },
  other: { "codex-preview": "development" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="theme-color" content="#f3f1e9" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "MOOD",
          "description": "A digital home for free spirits.",
          "url": "https://crestwavecoin.com/"
        })}} />
      </head>
      <body>
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
