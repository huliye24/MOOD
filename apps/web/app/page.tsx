import Link from "next/link";
import { MoodismArc } from "../components/mood/MoodismArc";

/** The root route is the entrance to the MOOD world, not a token surface. */
export default function HomePage() {
  return (
    <main className="mood-site">
      <nav className="mood-nav" aria-label="主导航">
        <Link className="mood-brand" href="/"><img src="/mood-logo.png" alt="" /><span>MOOD</span></Link>
        <div className="mood-nav-links"><Link href="/world">World</Link><Link href="/manifesto">Manifesto</Link><Link href="/canon">Canon</Link><Link href="/library">Library</Link><Link href="/protocol">Protocol</Link></div>
      </nav>

      <header className="mood-hero">
        <div className="mood-hero-copy">
          <span className="mood-kicker">MOODISM · PHASE ZERO · WORLDBUILDING</span>
          <h1><span>CONTRIBUTION IS GENESIS.</span><small>贡献驱动的<br /><em>网络文明。</em></small></h1>
          <p>MOODISM 通过开放协议协调人类创造力、机器智能与数字资源。MOOD 是这个世界与项目；协议和经济必须从明确意义中生长。</p>
          <div className="mood-actions"><Link className="mood-primary" href="/manifesto/moodism">阅读文明宣言</Link><Link className="mood-secondary" href="/canon">理解 Canon</Link></div>
        </div>
        <div className="mood-hero-mark" aria-hidden="true"><span className="mood-orbit mood-orbit-one" /><span className="mood-orbit mood-orbit-two" /><img src="/mood-logo.png" alt="" /><small>ENTER THE WORLD</small></div>
      </header>

      <section id="world" className="mood-world-gate">
        <div className="mood-world-intro"><span className="mood-kicker">THE AUTHORITY PATH</span><h2>意义先于机制。</h2><p>文明理念定义方向，Canon 约束权力，协议实现稳定规则。</p></div>
        <nav className="mood-world-map" aria-label="MOOD 权威路径"><Link href="/manifesto/moodism"><span>01</span><strong>MOODISM</strong><small>为什么</small></Link><Link href="/world"><span>02</span><strong>MOOD</strong><small>什么世界</small></Link><Link href="/canon"><span>03</span><strong>Canon</strong><small>什么边界</small></Link><Link href="/protocol"><span>04</span><strong>Protocol</strong><small>如何实现</small></Link></nav>
      </section>

      <MoodismArc />

      <section className="mood-visual-portal"><img src="/mood-civilization.png" alt="人类与机器共同建设开放的网络文明" /><div><span>HUMAN CREATIVITY · MACHINE INTELLIGENCE · DIGITAL RESOURCES</span><h2>一个仍在形成的<br />开放协调世界。</h2><Link href="/world">Explore the world →</Link></div></section>

      <section className="mood-principles" aria-label="MOODISM 的基础原则"><article><span>01</span><h3>贡献先于分配</h3><p>贡献声明必须经过证据与验证。</p></article><article><span>02</span><h3>权利绑定责任</h3><p>影响越大，责任与审计越严格。</p></article><article><span>03</span><h3>协议约束权力</h3><p>规则公开、过程可查、改变留痕。</p></article></section>

      <section id="use" className="mood-use">
        <div className="mood-use-intro"><span className="mood-kicker">CURRENT TRUTH</span><h2>现在是 Worldbuilding。</h2><div className="mood-mini-facts"><span>CANON v0.2</span><span>GENESIS DRAFT</span><span>NO IMPLIED ACTIVATION</span></div></div>
        <div className="mood-phase-card"><span>当前优先级</span><strong>Conceptual clarity</strong><div><Link href="/library">探索文档</Link><Link href="/portal">查看未来入口</Link><Link href="/genesis">Genesis 实验</Link></div></div>
      </section>

      <footer className="mood-footer"><Link className="mood-brand" href="/"><img src="/mood-logo.png" alt="" /><span>MOOD</span></Link><p>World before system. Contribution before reward.</p><div><Link href="/manifesto">Manifesto</Link><Link href="/canon">Canon</Link><Link href="/library">Library</Link><Link href="/protocol">Protocol</Link></div></footer>
    </main>
  );
}
