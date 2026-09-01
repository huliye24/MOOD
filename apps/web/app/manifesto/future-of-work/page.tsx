import { MoodDocument } from "../../../components/mood/MoodDocument";
import { loadMoodContent } from "../../../lib/mood-content";

export const metadata = { title: "Future of Work | MOOD Manifesto", description: "From employee to participant: work as verifiable contribution history." };
export default async function FutureOfWorkPage() { return <MoodDocument markdown={await loadMoodContent("manifesto/future-of-work.md")} current="Manifesto" section="MANIFESTO · FUTURE OF WORK" />; }
