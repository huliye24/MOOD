import manifestoIndex from "../content/mood/manifesto/index.md?raw";
import whyMood from "../content/mood/manifesto/why-mood.md?raw";
import futureOfWork from "../content/mood/manifesto/future-of-work.md?raw";
import futureOfCapital from "../content/mood/manifesto/future-of-capital.md?raw";
import openCoordination from "../content/mood/manifesto/open-coordination.md?raw";
import whatMoodIs from "../content/mood/canon/what-mood-is.md?raw";
import whatMoodIsNot from "../content/mood/canon/what-mood-is-not.md?raw";
import designPrinciples from "../content/mood/canon/design-principles.md?raw";
import protocolIndex from "../content/mood/protocol/index.md?raw";
import organization from "../content/mood/protocol/organization.md?raw";
import capital from "../content/mood/protocol/capital.md?raw";
import project from "../content/mood/protocol/project.md?raw";
import rights from "../content/mood/protocol/rights.md?raw";
import settlement from "../content/mood/protocol/settlement.md?raw";

const moodContent: Record<string, string> = {
  "manifesto/index.md": manifestoIndex,
  "manifesto/why-mood.md": whyMood,
  "manifesto/future-of-work.md": futureOfWork,
  "manifesto/future-of-capital.md": futureOfCapital,
  "manifesto/open-coordination.md": openCoordination,
  "canon/what-mood-is.md": whatMoodIs,
  "canon/what-mood-is-not.md": whatMoodIsNot,
  "canon/design-principles.md": designPrinciples,
  "protocol/index.md": protocolIndex,
  "protocol/organization.md": organization,
  "protocol/capital.md": capital,
  "protocol/project.md": project,
  "protocol/rights.md": rights,
  "protocol/settlement.md": settlement,
};

export async function loadMoodContent(relativePath: string): Promise<string> {
  const content = moodContent[relativePath];
  if (!content) throw new Error(`Unknown MOOD content document: ${relativePath}`);
  return content;
}
