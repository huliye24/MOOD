import { ProtocolHero, ProtocolMap } from "../../components/mood/ProtocolArchitecture";
import { MoodShell } from "../../components/mood/MoodShell";

export const metadata = {
  title: "MOOD Protocol Architecture | Open Coordination Network",
  description: "Explore MOOD protocol architecture: state transitions, contribution proofs, reputation, rights, treasury and governance.",
};

export default function ProtocolPage() {
  return <MoodShell current="Protocol"><ProtocolHero /><ProtocolMap /></MoodShell>;
}
