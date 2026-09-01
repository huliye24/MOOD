import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = {
  title: "MOOD Formal Specification | MOOD",
  description: "关于网络状态、验证逻辑、信誉算法、Agent 共识与经济方程的中文非规范性形式化草案。",
};

export default async function FormalSpecificationPage() {
  return (
    <MoodDocument
      markdown={await loadMoodContent("manifesto/formal-specification-cn.md")}
      current="Manifesto"
      section="MANIFESTO · FORMAL SPECIFICATION · 中文 · NON-NORMATIVE DRAFT"
    />
  );
}
