import type { Metadata } from "next";
import "./globals.css";
import SwRegister from "./sw-register";

export const metadata: Metadata = {
  title: "MOOD — World · Protocol · Portal",
  description: "A digital home for free spirits: an open world, protocol, and public memory for human and machine agency.",
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "https://crestwavecoin.com/" },
  openGraph: {
    title: "MOOD — World · Protocol · Portal",
    description: "A digital home for free spirits.",
    url: "https://crestwavecoin.com/",
    siteName: "MOOD",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MOOD — World · Protocol · Portal",
    description: "A digital home for free spirits.",
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
