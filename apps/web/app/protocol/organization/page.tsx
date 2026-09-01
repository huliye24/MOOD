import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Organization Protocol | MOOD", description: "Organizations participate as nodes without owning the whole network." };
export default async function OrganizationPage() { return <MoodDocument markdown={await loadMoodContent("protocol/organization.md")} current="Protocol" section="PROTOCOL · ORGANIZATION" />; }
