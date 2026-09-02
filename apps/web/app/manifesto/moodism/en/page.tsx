import Link from "next/link";
import { MoodDocument } from "../../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../../lib/mood-content";
import { MoodismArc } from "../../../../components/mood/MoodismArc";

export const metadata = {
  title: "MOODISM Manifesto 001 | MOOD",
  description: "A manifesto for a contribution-driven network civilization.",
};

export default async function MoodismEnglishPage() {
  return (
    <>
      <nav className="mood-language-nav" aria-label="MOODISM language">
        <strong>v0.3</strong>
        <Link href="/manifesto/moodism">中文</Link>
        <span>English</span>
        <Link href="/manifesto/moodism/v0.2/en">Read v0.2</Link>
        <Link href="/manifesto/moodism/v0.1/en">Read v0.1</Link>
      </nav>
      <MoodismArc />
      <MoodDocument
        markdown={await loadMoodContent("manifesto/moodism-en.md")}
        current="Manifesto"
        section="MANIFESTO · MOODISM · v0.3 · ENGLISH · GENESIS DRAFT III"
      />
    </>
  );
}
