import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Future of Capital | MOOD Manifesto", description: "Capital as one participant within an open contribution network." };
export default async function FutureOfCapitalPage() { return <MoodDocument markdown={await loadMoodContent("manifesto/future-of-capital.md")} current="Manifesto" section="MANIFESTO · FUTURE OF CAPITAL" />; }
