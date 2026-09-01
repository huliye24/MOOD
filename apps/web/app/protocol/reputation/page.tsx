import { ProtocolDocument } from "../../../components/mood/ProtocolArchitecture";
import { loadMoodContent } from "../../../lib/mood-content";
export const metadata = { title: "Reputation | MOOD Protocol", description: "Evidence-based historical contribution, distinct from transferable economic value." };
export default async function Page() { return <ProtocolDocument title="Reputation" steps={["EVIDENCE", "VERIFICATION", "HISTORY", "REPUTATION"]} markdown={await loadMoodContent("protocol/reputation-engine.md")} />; }
