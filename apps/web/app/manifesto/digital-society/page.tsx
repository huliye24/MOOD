import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Digital Society | MOOD Manifesto", description: "MOOD explores coordination as the next layer of digital society." };
export default async function DigitalSocietyPage() { return <MoodDocument markdown={await loadMoodContent("manifesto/digital-society.md")} current="World" section="MANIFESTO · DIGITAL SOCIETY" />; }
