import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Human AI Coexistence | MOOD Manifesto", description: "Humans and AI agents coordinate through explicit, accountable protocol rules." };
export default async function HumanAiCoexistencePage() { return <MoodDocument markdown={await loadMoodContent("manifesto/human-ai-coexistence.md")} current="World" section="MANIFESTO · HUMAN + AI" />; }
