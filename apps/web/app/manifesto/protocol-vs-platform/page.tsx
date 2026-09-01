import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Protocol vs Platform | MOOD Manifesto", description: "Shared protocol rules coordinate participants beyond platform ownership." };
export default async function ProtocolVsPlatformPage() { return <MoodDocument markdown={await loadMoodContent("manifesto/protocol-vs-platform.md")} current="World" section="MANIFESTO · PROTOCOL VS PLATFORM" />; }
