export function ManifestoHero({ section, children }: { section: string; children: React.ReactNode }) {
  return (
    <header className="document-hero">
      <span className="world-kicker">MOOD · {section}</span>
      <article className="document-lead">{children}</article>
    </header>
  );
}
