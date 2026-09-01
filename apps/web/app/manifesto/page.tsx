import { MoodDocument } from "../../components/mood/MoodDocument";
import { loadMoodContent } from "../../lib/mood-content";

export const metadata = { title: "Manifesto | MOOD", description: "Enter the MOOD world: a new coordination layer for humans, machines and organizations." };
export default async function ManifestoPage() { return <MoodDocument markdown={await loadMoodContent("manifesto/index.md")} current="Manifesto" section="MANIFESTO" />; }
