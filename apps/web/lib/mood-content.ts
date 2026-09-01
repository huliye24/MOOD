import manifestoIndex from "../content/mood/manifesto/index.md?raw";
import whyMood from "../content/mood/manifesto/why-mood.md?raw";
import futureOfWork from "../content/mood/manifesto/future-of-work.md?raw";
import futureOfCapital from "../content/mood/manifesto/future-of-capital.md?raw";
import openCoordination from "../content/mood/manifesto/open-coordination.md?raw";
import digitalSociety from "../content/mood/manifesto/digital-society.md?raw";
import protocolVsPlatform from "../content/mood/manifesto/protocol-vs-platform.md?raw";
import fromCompanyToNetwork from "../content/mood/manifesto/from-company-to-network.md?raw";
import humanAiCoexistence from "../content/mood/manifesto/human-ai-coexistence.md?raw";
import whatMoodIs from "../content/mood/canon/what-mood-is.md?raw";
import whatMoodIsNot from "../content/mood/canon/what-mood-is-not.md?raw";
import designPrinciples from "../content/mood/canon/design-principles.md?raw";
import economicPhilosophy from "../content/mood/canon/economic-philosophy.md?raw";
import governancePhilosophy from "../content/mood/canon/governance-philosophy.md?raw";
import protocolIndex from "../content/mood/protocol/index.md?raw";
import organization from "../content/mood/protocol/organization.md?raw";
import capital from "../content/mood/protocol/capital.md?raw";
import project from "../content/mood/protocol/project.md?raw";
import rights from "../content/mood/protocol/rights.md?raw";
import settlement from "../content/mood/protocol/settlement.md?raw";
import passport from "../content/mood/protocol/passport.md?raw";
import agent from "../content/mood/protocol/agent.md?raw";
import node from "../content/mood/protocol/node.md?raw";
import verification from "../content/mood/protocol/verification.md?raw";

const moodContent: Record<string, string> = {
  "manifesto/index.md": manifestoIndex,
  "manifesto/why-mood.md": whyMood,
  "manifesto/future-of-work.md": futureOfWork,
  "manifesto/future-of-capital.md": futureOfCapital,
  "manifesto/open-coordination.md": openCoordination,
  "manifesto/digital-society.md": digitalSociety,
  "manifesto/protocol-vs-platform.md": protocolVsPlatform,
  "manifesto/from-company-to-network.md": fromCompanyToNetwork,
  "manifesto/human-ai-coexistence.md": humanAiCoexistence,
  "canon/what-mood-is.md": whatMoodIs,
  "canon/what-mood-is-not.md": whatMoodIsNot,
  "canon/design-principles.md": designPrinciples,
  "canon/economic-philosophy.md": economicPhilosophy,
  "canon/governance-philosophy.md": governancePhilosophy,
  "protocol/index.md": protocolIndex,
  "protocol/organization.md": organization,
  "protocol/capital.md": capital,
  "protocol/project.md": project,
  "protocol/rights.md": rights,
  "protocol/settlement.md": settlement,
  "protocol/passport.md": passport,
  "protocol/agent.md": agent,
  "protocol/node.md": node,
  "protocol/verification.md": verification,
};

export async function loadMoodContent(relativePath: string): Promise<string> {
  const content = moodContent[relativePath];
  if (!content) throw new Error(`Unknown MOOD content document: ${relativePath}`);
  return content;
}
