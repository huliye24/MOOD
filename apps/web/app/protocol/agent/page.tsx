import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Agent Protocol | MOOD", description: "Explicit identity, authority and accountability for AI agents." };
export default async function AgentPage() { return <MoodDocument markdown={await loadMoodContent("protocol/agent.md")} current="Protocol" section="PROTOCOL · AGENT" />; }
