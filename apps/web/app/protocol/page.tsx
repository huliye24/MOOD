import { MoodDocument } from "../../components/mood/MoodDocument";
import { loadMoodContent } from "../../lib/mood-content";

export const metadata = { title: "Protocol | MOOD", description: "Identity, contribution, proof, reputation, rights and settlement in the MOOD coordination protocol." };
export default async function ProtocolPage() { return <MoodDocument markdown={await loadMoodContent("protocol/index.md")} current="Protocol" section="PROTOCOL" />; }
