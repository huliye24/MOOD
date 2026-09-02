import Link from "next/link";
import { MoodDocument } from "../../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../../lib/mood-content";

export const metadata = {
  title: "MOODISM Manifesto 001 v0.1 中文 | MOOD",
  description: "MOODISM 文明宣言的第一个保留版本。",
};

export default async function MoodismV01ChinesePage() {
  return (
    <>
      <nav className="mood-language-nav" aria-label="MOODISM version and language">
        <strong>v0.1 · preserved</strong>
        <span>中文</span>
        <Link href="/manifesto/moodism/v0.1/en">English</Link>
        <Link href="/manifesto/moodism">阅读 v0.3</Link>
        <Link href="/manifesto/moodism/v0.2">阅读 v0.2</Link>
      </nav>
      <MoodDocument
        markdown={await loadMoodContent("manifesto/moodism-v0.1-cn.md")}
        current="Manifesto"
        section="MANIFESTO · MOODISM · v0.1 · 中文 · PRESERVED GENESIS DRAFT"
      />
    </>
  );
}
