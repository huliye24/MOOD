import manifestoIndex from "../content/mood/manifesto/index.md?raw";
import whyMood from "../content/mood/manifesto/why-mood.md?raw";
import futureOfWork from "../content/mood/manifesto/future-of-work.md?raw";
import futureOfCapital from "../content/mood/manifesto/future-of-capital.md?raw";
import openCoordination from "../content/mood/manifesto/open-coordination.md?raw";
import digitalSociety from "../content/mood/manifesto/digital-society.md?raw";
import protocolVsPlatform from "../content/mood/manifesto/protocol-vs-platform.md?raw";
import fromCompanyToNetwork from "../content/mood/manifesto/from-company-to-network.md?raw";
import humanAiCoexistence from "../content/mood/manifesto/human-ai-coexistence.md?raw";
import moodismV01Cn from "../../../docs/manifesto/MOODISM_MANIFESTO_001_ZH.md?raw";
import moodismV01En from "../../../docs/manifesto/MOODISM_MANIFESTO_001_EN.md?raw";
import moodismV02Cn from "../../../docs/manifesto/MOODISM_MANIFESTO_001_V0.2_ZH.md?raw";
import moodismV02En from "../../../docs/manifesto/MOODISM_MANIFESTO_001_V0.2_EN.md?raw";
import moodismCn from "../../../docs/manifesto/MOODISM_MANIFESTO_001_V0.3_ZH.md?raw";
import moodismEn from "../../../docs/manifesto/MOODISM_MANIFESTO_001_V0.3_EN.md?raw";
import proofOfIntelligenceCn from "../content/mood/manifesto/proof-of-intelligence-cn.md?raw";
import technicalArchitectureCn from "../content/mood/manifesto/technical-architecture-cn.md?raw";
import protocolYellowPaperCn from "../content/mood/manifesto/protocol-yellow-paper-cn.md?raw";
import formalSpecificationCn from "../content/mood/manifesto/formal-specification-cn.md?raw";
import clientImplementationCn from "../content/mood/manifesto/client-implementation-cn.md?raw";
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
import stateMachine from "../content/mood/protocol/state-machine.md?raw";
import contributionProof from "../content/mood/protocol/contribution-proof.md?raw";
import reputationEngine from "../content/mood/protocol/reputation-engine.md?raw";
import rightsSystem from "../content/mood/protocol/rights-system.md?raw";
import treasuryDesign from "../content/mood/protocol/treasury.md?raw";
import governanceProcess from "../content/mood/protocol/governance-process.md?raw";

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
  "manifesto/moodism-cn.md": moodismCn,
  "manifesto/moodism-en.md": moodismEn,
  "manifesto/moodism-v0.1-cn.md": moodismV01Cn,
  "manifesto/moodism-v0.1-en.md": moodismV01En,
  "manifesto/moodism-v0.2-cn.md": moodismV02Cn,
  "manifesto/moodism-v0.2-en.md": moodismV02En,
  "manifesto/proof-of-intelligence-cn.md": proofOfIntelligenceCn,
  "manifesto/technical-architecture-cn.md": technicalArchitectureCn,
  "manifesto/protocol-yellow-paper-cn.md": protocolYellowPaperCn,
  "manifesto/formal-specification-cn.md": formalSpecificationCn,
  "manifesto/client-implementation-cn.md": clientImplementationCn,
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
  "protocol/state-machine.md": stateMachine,
  "protocol/contribution-proof.md": contributionProof,
  "protocol/reputation-engine.md": reputationEngine,
  "protocol/rights-system.md": rightsSystem,
  "protocol/treasury.md": treasuryDesign,
  "protocol/governance-process.md": governanceProcess,
};

export async function loadMoodContent(relativePath: string): Promise<string> {
  const content = moodContent[relativePath];
  if (!content) throw new Error(`Unknown MOOD content document: ${relativePath}`);
  return content;
}
