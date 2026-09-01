import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Capital Protocol | MOOD", description: "Capital as one contribution and coordination resource within the MOOD network." };
export default async function CapitalPage() { return <MoodDocument markdown={await loadMoodContent("protocol/capital.md")} current="Protocol" section="PROTOCOL · CAPITAL" />; }
