import Link from "next/link";
import { DocumentRenderer } from "./DocumentRenderer";
import { MoodShell } from "./MoodShell";

type FlowProps = { steps: readonly string[]; label: string };

export function LifecycleFlow({ steps, label }: FlowProps) {
  return (
    <div className="protocol-flow" role="img" aria-label={label}>
      {steps.map((step, index) => (
        <div className="protocol-flow-step" key={step}>
          <span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong>
          {index < steps.length - 1 && <i aria-hidden="true">↓</i>}
        </div>
      ))}
    </div>
  );
}

export function StateDiagram({ steps, label }: FlowProps) {
  return <LifecycleFlow steps={steps} label={label} />;
}

export function ConceptCard({ index, title, description, href }: { index: string; title: string; description: string; href: string }) {
  return <Link className="protocol-concept" href={href}><small>{index}</small><h2>{title}</h2><p>{description}</p><span>Explore module →</span></Link>;
}

const concepts = [
  ["01", "State", "How valid actions transform the coordination network.", "/protocol/state-machine"],
  ["02", "Action", "What participants do inside an explicit ruleset.", "/protocol/contribution-proof"],
  ["03", "Proof", "How evidence makes contribution inspectable.", "/protocol/contribution-proof"],
  ["04", "Reputation", "How verified historical contribution accumulates.", "/protocol/reputation"],
  ["05", "Rights", "How participation ability is made explicit.", "/protocol/rights"],
  ["06", "Settlement", "How authorized outcomes may follow verified state.", "/protocol/treasury"],
] as const;

export function ProtocolHero() {
  return <header className="protocol-architecture-hero"><span className="world-kicker">MOOD · PROTOCOL ARCHITECTURE</span><p className="protocol-status">CONCEPTUAL ARCHITECTURE · PHASE ZERO</p><h1>Coordination,<br />made legible.</h1><p>A coordination system for humans, AI agents, organizations and resources.</p><LifecycleFlow label="MOOD coordination sequence" steps={["IDENTITY", "CONTRIBUTION", "PROOF", "REPUTATION", "RIGHTS", "SETTLEMENT"]} /></header>;
}

export function ProtocolMap() {
  return <><figure className="protocol-sketch"><img src="/mood-network-cycle.png" alt="开发者、算力、数据、资金与社区进入协议，经由证明、声誉与权利形成开放资源循环的概念图" /><figcaption><span>CONCEPT SKETCH · PHASE ZERO</span><p>一张帮助理解开放协调循环的草图；它不是 Mainnet、收益或已部署系统的声明。</p></figcaption></figure><section className="protocol-map"><div className="protocol-map-intro"><span>THE SYSTEM</span><h2>Meaning becomes state.</h2><p>These modules define a protocol skeleton, not a claim that a production network, treasury, governance process, or settlement system is active.</p></div><div className="protocol-concept-grid">{concepts.map(([index, title, description, href]) => <ConceptCard key={index} index={index} title={title} description={description} href={href} />)}</div><nav className="protocol-deep-links" aria-label="Protocol modules"><Link href="/protocol/state-machine">State Machine</Link><Link href="/protocol/contribution-proof">Contribution Proof</Link><Link href="/protocol/reputation">Reputation</Link><Link href="/protocol/rights">Rights</Link><Link href="/protocol/treasury">Treasury</Link><Link href="/protocol/governance">Governance</Link></nav></section></>;
}

export function ProtocolDocument({ markdown, title, steps }: { markdown: string; title: string; steps: readonly string[] }) {
  return <MoodShell current="Protocol"><header className="protocol-document-hero"><span className="world-kicker">MOOD · PROTOCOL · {title.toUpperCase()}</span><p className="protocol-status">CONCEPTUAL MODULE · NOT AN ACTIVE-SERVICE CLAIM</p><StateDiagram label={`${title} lifecycle`} steps={steps} /></header><article className="protocol-document"><DocumentRenderer markdown={markdown} /></article></MoodShell>;
}
