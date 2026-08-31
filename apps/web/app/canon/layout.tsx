import type { Metadata } from "next";
import "./canon.css";

export const metadata: Metadata = {
  title: "MOOD Canon · The World Before the System",
  description:
    "The MOOD Canon defines the highest-level conceptual and developmental order of the project. World before system. Meaning before mechanism. Canon before code.",
};

export default function CanonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
