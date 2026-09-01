import Link from "next/link";
import { MoodShell } from "../../components/mood/MoodShell";

export const metadata = {
  title: "Portal | MOOD — Draft",
  description: "MOOD Portal is a future participation surface. It remains visibly Draft during Phase Zero.",
  robots: { index: false, follow: false },
};

const futureSurfaces = [
  ["01", "Identity", "How a human or machine actor becomes legible."],
  ["02", "Passport", "A future interface for identity, proof and participation."],
  ["03", "Contribution", "How meaningful action may become inspectable evidence."],
  ["04", "Governance", "How legitimate decisions may eventually be recorded."],
] as const;

export default function PortalPage() {
  return (
    <MoodShell>
      <header className="portal-world-hero">
        <span className="world-kicker">MOOD · PORTAL</span>
        <p className="portal-draft">DRAFT · PHASE ZERO · NO ACTIVE PARTICIPATION FLOWS</p>
        <h1>入口已经可见，<br />但尚未开放。</h1>
        <p>Portal 是未来参与 MOOD 的界面。当前 Canon 尚未授权公开身份、Passport、治理或链上参与流程，因此这里诚实地保持为一扇尚未开启的门。</p>
        <div className="portal-actions"><Link href="/canon">阅读 Canon</Link><Link href="/protocol">理解 Protocol</Link></div>
      </header>
      <section className="portal-future" aria-labelledby="portal-future-title">
        <div className="portal-future-intro"><span>THE FUTURE SURFACE</span><h2 id="portal-future-title">这里将来会出现什么？</h2><p>每一项能力都必须先在 Canon 与协议文档中获得清晰定义，再成为真实界面。</p></div>
        <div className="portal-future-grid">{futureSurfaces.map(([index, title, description]) => <article key={index}><small>{index}</small><h3>{title}</h3><p>{description}</p><span>PLANNED</span></article>)}</div>
      </section>
      <section className="portal-truth">
        <span className="world-kicker">PROOF BEFORE CLAIM</span>
        <h2>网站不会把未来伪装成现在。</h2>
        <div><p>没有公开参与流程</p><p>没有实时用户或节点数字</p><p>没有模拟链上交易</p><p>没有未经验证的治理活动</p></div>
      </section>
    </MoodShell>
  );
}
