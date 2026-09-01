import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Passport Protocol | MOOD", description: "Portable network identity, roles, contribution history and permissions." };
export default async function PassportPage() { return <MoodDocument markdown={await loadMoodContent("protocol/passport.md")} current="Protocol" section="PROTOCOL · PASSPORT" />; }
