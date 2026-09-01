import { ProtocolDocument } from "../../../components/mood/ProtocolArchitecture";
import { loadMoodContent } from "../../../lib/mood-content";
export const metadata = { title: "State Machine | MOOD Protocol", description: "How actions, rules and validation produce new MOOD network state." };
export default async function Page() { return <ProtocolDocument title="State Machine" steps={["NETWORK STATE", "ACTION", "VALIDATION", "NEW STATE"]} markdown={await loadMoodContent("protocol/state-machine.md")} />; }
