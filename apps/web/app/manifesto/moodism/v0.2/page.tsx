import Link from "next/link";
import { MoodDocument } from "../../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../../lib/mood-content";

export const metadata = {
  title: "MOODISM Manifesto 001 v0.2 中文 | MOOD",
  description: "MOODISM 文明宣言第二个保留版本：人的尊严先于贡献。",
};

export default async function MoodismV02ChinesePage() {
  return (
    <>
      <nav className="mood-language-nav" aria-label="MOODISM version and language">
        <strong>v0.2 · preserved</strong>
        <span>中文</span>
        <Link href="/manifesto/moodism/v0.2/en">English</Link>
        <Link href="/manifesto/moodism">阅读 v0.3</Link>
        <Link href="/manifesto/moodism/v0.1">回看 v0.1</Link>
      </nav>
      <MoodDocument
        markdown={await loadMoodContent("manifesto/moodism-v0.2-cn.md")}
        current="Manifesto"
        section="MANIFESTO · MOODISM · v0.2 · 中文 · PRESERVED GENESIS DRAFT"
      />
    </>
  );
}
