import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Node Protocol | MOOD", description: "Nodes provide verifiable value or resources to the MOOD network." };
export default async function NodePage() { return <MoodDocument markdown={await loadMoodContent("protocol/node.md")} current="Protocol" section="PROTOCOL · NODE" />; }
