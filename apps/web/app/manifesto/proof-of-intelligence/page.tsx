import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = {
  title: "Proof of Intelligence：智能证明 | MOOD",
  description: "关于识别、验证和记录智能贡献的 MOOD 中文概念提案。",
};

export default async function ProofOfIntelligencePage() {
  return (
    <MoodDocument
      markdown={await loadMoodContent("manifesto/proof-of-intelligence-cn.md")}
      current="Manifesto"
      section="MANIFESTO · PROOF OF INTELLIGENCE · 中文 · DRAFT"
    />
  );
}
