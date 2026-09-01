import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = {
  title: "MOOD Protocol Client Implementation | MOOD",
  description: "关于数据结构、合约、Agent Runtime、Proof Engine、信誉数据库与 Genesis 的中文非规范性实现草案。",
};

export default async function ClientImplementationPage() {
  return (
    <MoodDocument
      markdown={await loadMoodContent("manifesto/client-implementation-cn.md")}
      current="Manifesto"
      section="MANIFESTO · CLIENT IMPLEMENTATION · 中文 · NON-NORMATIVE DRAFT"
    />
  );
}
