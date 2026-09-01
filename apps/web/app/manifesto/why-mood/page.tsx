import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Why MOOD | Manifesto", description: "Why open coordination must extend beyond platforms and organizational boundaries." };
export default async function WhyMoodPage() { return <MoodDocument markdown={await loadMoodContent("manifesto/why-mood.md")} current="Manifesto" section="MANIFESTO · WHY MOOD" />; }
