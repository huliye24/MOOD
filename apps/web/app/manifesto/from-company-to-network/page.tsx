import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "From Company to Network | MOOD Manifesto", description: "Organizations remain participants while coordination expands into networks." };
export default async function FromCompanyToNetworkPage() { return <MoodDocument markdown={await loadMoodContent("manifesto/from-company-to-network.md")} current="World" section="MANIFESTO · COMPANY TO NETWORK" />; }
