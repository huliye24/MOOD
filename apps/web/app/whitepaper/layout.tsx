import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MOOD Whitepaper v0.1",
  description: "The architecture and protocol design of MOOD: an open coordination network for human and machine agency.",
  alternates: { canonical: "https://crestwavecoin.com/whitepaper" },
  openGraph: {
    title: "MOOD Whitepaper v0.1",
    description: "Identity, contribution, proof, reputation, agents, nodes, governance and settlement.",
    url: "https://crestwavecoin.com/whitepaper",
    siteName: "MOOD",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "MOOD Whitepaper v0.1",
    description: "An open coordination protocol and digital world for human and machine agency.",
  },
};

export default function WhitepaperLayout({ children }: { children: React.ReactNode }) {
  return children;
}
