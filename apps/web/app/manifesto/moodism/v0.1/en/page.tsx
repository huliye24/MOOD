import Link from "next/link";
import { MoodDocument } from "../../../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../../../lib/mood-content";

export const metadata = {
  title: "MOODISM Manifesto 001 v0.1 English | MOOD",
  description: "The preserved first version of the MOODISM Manifesto.",
};

export default async function MoodismV01EnglishPage() {
  return (
    <>
      <nav className="mood-language-nav" aria-label="MOODISM version and language">
        <strong>v0.1 · preserved</strong>
        <Link href="/manifesto/moodism/v0.1">中文</Link>
        <span>English</span>
        <Link href="/manifesto/moodism/en">Read v0.3</Link>
        <Link href="/manifesto/moodism/v0.2/en">Read v0.2</Link>
      </nav>
      <MoodDocument
        markdown={await loadMoodContent("manifesto/moodism-v0.1-en.md")}
        current="Manifesto"
        section="MANIFESTO · MOODISM · v0.1 · ENGLISH · PRESERVED GENESIS DRAFT"
      />
    </>
  );
}
