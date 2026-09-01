import { ProtocolDocument } from "../../../components/mood/ProtocolArchitecture";
import { loadMoodContent } from "../../../lib/mood-content";
export const metadata = { title: "Contribution Proof | MOOD Protocol", description: "How tasks become verifiable contribution history in MOOD." };
export default async function Page() { return <ProtocolDocument title="Contribution Proof" steps={["TASK", "EXECUTION", "EVIDENCE", "VERIFICATION", "CONTRIBUTION", "REPUTATION", "SETTLEMENT"]} markdown={await loadMoodContent("protocol/contribution-proof.md")} />; }
