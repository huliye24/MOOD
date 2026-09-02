import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";
import Link from "next/link";

export const metadata = {
  title: "MOODism：贡献驱动的网络文明 | MOOD Manifesto",
  description: "一篇关于贡献、信誉、权益与开放网络协作的中文 MOOD 思想文稿。",
};

export default async function MoodismPage() {
  return (
    <>
      <nav className="mood-language-nav" aria-label="MOODISM language">
        <strong>v0.3</strong>
        <span>中文</span>
        <Link href="/manifesto/moodism/en">English</Link>
        <Link href="/manifesto/moodism/v0.2">回看 v0.2</Link>
        <Link href="/manifesto/moodism/v0.1">回看 v0.1</Link>
      </nav>
      <MoodDocument
        markdown={await loadMoodContent("manifesto/moodism-cn.md")}
        current="Manifesto"
        section="MANIFESTO · MOODISM · v0.3 · 中文 · GENESIS DRAFT III"
      />
    </>
  );
}
