import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Governance Philosophy | MOOD", description: "Visible and accountable coordination for changing shared rules." };
export default async function GovernancePhilosophyPage() { return <MoodDocument markdown={await loadMoodContent("canon/governance-philosophy.md")} current="World" section="WORLD · GOVERNANCE PHILOSOPHY" />; }
