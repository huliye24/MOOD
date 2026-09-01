import { MoodDocument } from "../../components/mood/MoodDocument";
import { loadMoodContent } from "../../lib/mood-content";

export const metadata = { title: "Vision | MOOD", description: "The MOOD vision for open coordination among humans, AI agents, organizations and resources." };
export default async function VisionPage() { return <MoodDocument markdown={await loadMoodContent("canon/what-mood-is.md")} current="World" section="WORLD" />; }
