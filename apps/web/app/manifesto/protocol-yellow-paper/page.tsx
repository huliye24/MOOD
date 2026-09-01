import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = {
  title: "MOOD Protocol Specification · Yellow Paper | MOOD",
  description: "关于状态、贡献验证、智能共识、信誉、权益与 Agent 交互的中文非规范性协议草案。",
};

export default async function ProtocolYellowPaperPage() {
  return (
    <MoodDocument
      markdown={await loadMoodContent("manifesto/protocol-yellow-paper-cn.md")}
      current="Manifesto"
      section="MANIFESTO · YELLOW PAPER · 中文 · NON-NORMATIVE DRAFT"
    />
  );
}
