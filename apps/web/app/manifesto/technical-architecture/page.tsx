import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = {
  title: "MOOD Technical Architecture | MOOD",
  description: "关于 PoI、贡献证明、信誉、权益与 AI Agent Network 的中文技术架构概念稿。",
};

export default async function TechnicalArchitecturePage() {
  return (
    <MoodDocument
      markdown={await loadMoodContent("manifesto/technical-architecture-cn.md")}
      current="Manifesto"
      section="MANIFESTO · TECHNICAL ARCHITECTURE · 中文 · DRAFT"
    />
  );
}
