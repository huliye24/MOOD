import { ProtocolDocument } from "../../../components/mood/ProtocolArchitecture";
import { loadMoodContent } from "../../../lib/mood-content";
export const metadata = { title: "Rights | MOOD Protocol", description: "How contribution and reputation may produce explicit participation rights." };
export default async function Page() { return <ProtocolDocument title="Rights" steps={["CONTRIBUTION", "REPUTATION", "RIGHTS", "PARTICIPATION"]} markdown={await loadMoodContent("protocol/rights-system.md")} />; }
