import { MoodShell } from "./MoodShell";
import { ConceptSection } from "./ConceptSection";
import { DocumentRenderer } from "./DocumentRenderer";
import { ManifestoHero } from "./ManifestoHero";

export function MoodDocument({ markdown, current, section }: { markdown: string; current: string; section: string }) {
  return (
    <MoodShell current={current}>
      <ManifestoHero section={section}><DocumentRenderer markdown={markdown} /></ManifestoHero>
      <ConceptSection />
    </MoodShell>
  );
}
