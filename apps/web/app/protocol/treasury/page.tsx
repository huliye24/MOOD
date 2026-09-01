import { ProtocolDocument } from "../../../components/mood/ProtocolArchitecture";
import { loadMoodContent } from "../../../lib/mood-content";
export const metadata = { title: "Treasury | MOOD Protocol", description: "A transparent conceptual model for shared MOOD network resources." };
export default async function Page() { return <ProtocolDocument title="Treasury" steps={["TREASURY", "DEVELOPMENT", "RESEARCH", "INFRASTRUCTURE", "GRANTS", "SECURITY"]} markdown={await loadMoodContent("protocol/treasury.md")} />; }
