import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = {
  title: "MOODism：贡献驱动的网络文明 | MOOD Manifesto",
  description: "一篇关于贡献、信誉、权益与开放网络协作的中文 MOOD 思想文稿。",
};

export default async function MoodismPage() {
  return (
    <MoodDocument
      markdown={await loadMoodContent("manifesto/moodism-cn.md")}
      current="Manifesto"
      section="MANIFESTO · MOODISM · 中文 · DRAFT"
    />
  );
}
