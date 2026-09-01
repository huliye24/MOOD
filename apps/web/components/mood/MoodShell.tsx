import Link from "next/link";
import { WalletLoginButton } from "./WalletLoginButton";

const links = [
  ["World", "/world"],
  ["Manifesto", "/manifesto"],
  ["Canon", "/canon"],
  ["Library", "/library"],
  ["Protocol", "/protocol"],
] as const;

export function MoodShell({ children, current }: { children: React.ReactNode; current?: string }) {
  return (
    <main className="mood-interface">
      <nav className="world-nav" aria-label="MOOD navigation">
        <Link className="world-brand" href="/">
          <img src="/mood-logo.png" alt="" />
          <span>MOOD</span>
        </Link>
        <div className="world-links">
          {links.map(([label, href]) => (
            <Link key={label} href={href} aria-current={current === label ? "page" : undefined}>{label}</Link>
          ))}
        </div>
        <WalletLoginButton className="world-wallet" />
      </nav>
      {children}
      <footer className="world-footer">
        <Link className="world-brand" href="/"><img src="/mood-logo.png" alt="" /><span>MOOD</span></Link>
        <p>WORLD BEFORE SYSTEM · PHASE ZERO</p>
        <div><Link href="/manifesto">Manifesto</Link><Link href="/canon">Canon</Link><a href="https://github.com/huliye24/MOOD" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </footer>
    </main>
  );
}
