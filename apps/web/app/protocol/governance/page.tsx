import { ProtocolDocument } from "../../../components/mood/ProtocolArchitecture";
import { loadMoodContent } from "../../../lib/mood-content";
export const metadata = { title: "Governance | MOOD Protocol", description: "The proposed visible lifecycle for MOOD Improvement Proposals." };
export default async function Page() { return <ProtocolDocument title="Governance" steps={["DRAFT", "DISCUSSION", "REVIEW", "VOTE", "EXECUTE"]} markdown={await loadMoodContent("protocol/governance-process.md")} />; }
