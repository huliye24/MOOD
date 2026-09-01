import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Economic Philosophy | MOOD", description: "Capital, contribution, reputation and rights remain distinct dimensions." };
export default async function EconomicPhilosophyPage() { return <MoodDocument markdown={await loadMoodContent("canon/economic-philosophy.md")} current="World" section="WORLD · ECONOMIC PHILOSOPHY" />; }
