import Link from "next/link";

const links = [
  ["World", "/vision"],
  ["Manifesto", "/manifesto"],
  ["Protocol", "/protocol"],
  ["Library", "/library"],
] as const;

export function MoodShell({ children, current }: { children: React.ReactNode; current?: string }) {
  return (
    <main className="mood-interface">
      <nav className="world-nav" aria-label="MOOD navigation">
        <Link className="world-brand" href="/">
          <img src="/moodify-brand-logo.png" alt="" />
          <span>MOOD</span>
        </Link>
        <div className="world-links">
          {links.map(([label, href]) => (
            <Link key={label} href={href} aria-current={current === label ? "page" : undefined}>{label}</Link>
          ))}
        </div>
        <Link className="world-wallet" href="/network">Enter Network</Link>
      </nav>
      {children}
      <footer className="world-footer">
        <Link className="world-brand" href="/"><img src="/moodify-brand-logo.png" alt="" /><span>MOOD</span></Link>
        <p>WORLD · PROTOCOL · PORTAL</p>
        <div><Link href="/canon">Canon</Link><Link href="/library">Library</Link><a href="https://github.com/huliye24/MOOD" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </footer>
    </main>
  );
}
