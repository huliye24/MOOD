import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Verification Protocol | MOOD", description: "Evidence connects action, contribution, reputation and settlement." };
export default async function VerificationPage() { return <MoodDocument markdown={await loadMoodContent("protocol/verification.md")} current="Protocol" section="PROTOCOL · VERIFICATION" />; }
