"use client";

import Link from "next/link";
import { useState } from "react";
import { MOOD_TOKEN } from "../../lib/mood-token";

export default function TokenPage() {
  const [copyStatus, setCopyStatus] = useState("");

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(MOOD_TOKEN.address);
      setCopyStatus("合约地址已复制");
    } catch {
      setCopyStatus("复制失败，请手动复制合约地址");
    }
  }

  return (
    <main className="mood-site">
      <nav className="mood-nav" aria-label="Token navigation">
        <Link className="mood-brand" href="/"><img src="/mood-logo.png" alt="" /><span>MOOD</span></Link>
        <div className="mood-nav-links"><Link href="/">World</Link><Link href="/canon">Canon</Link><Link href="/protocol">Protocol</Link><Link href="/genesis">Genesis</Link></div>
      </nav>

      <header className="mood-hero">
        <div className="mood-hero-copy">
          <span className="mood-kicker">ECONOMY · OBSERVABLE CONTRACT · ROLE UNRESOLVED</span>
          <h1><span>MOOD TOKEN</span><small>事实可验证，<br /><em>角色仍待定义。</em></small></h1>
          <p>以下内容记录一个现有链上合约。合约存在不等于 MOOD Protocol 经济、治理、奖励、财库或分配机制已经启用。</p>
          <div className="mood-actions"><Link className="mood-primary" href="/canon">阅读 Token 边界</Link><Link className="mood-secondary" href="/protocol">查看协议状态</Link></div>
        </div>
      </header>

      <section className="mood-world-gate" aria-labelledby="token-facts-title">
        <div className="mood-world-intro"><span className="mood-kicker">VERIFIABLE FACTS</span><h2 id="token-facts-title">链上事实</h2><p>应用只从一个配置来源读取这些字段。</p></div>
        <div className="mood-phase-card">
          <span>{MOOD_TOKEN.network} · Chain ID {MOOD_TOKEN.chainId}</span>
          <strong>{MOOD_TOKEN.name} · {MOOD_TOKEN.symbol}</strong>
          <p>{MOOD_TOKEN.totalSupplyDisplay}</p>
          <code style={{ wordBreak: "break-all" }}>{MOOD_TOKEN.address}</code>
          <button type="button" onClick={copyAddress}>复制合约地址</button>
          <p aria-live="polite">{copyStatus}</p>
        </div>
      </section>

      <section className="mood-principles" aria-label="Contract links">
        <article><span>01</span><h3>Explorer</h3><p>在 BscScan 检查合约。</p><a href={MOOD_TOKEN.explorerUrl} target="_blank" rel="noopener noreferrer">打开区块浏览器 ↗</a></article>
        <article><span>02</span><h3>Market</h3><p>外部市场入口不代表 MOOD 对价格或流动性作出保证。</p><a href={MOOD_TOKEN.tradeUrl} target="_blank" rel="noopener noreferrer">打开外部市场 ↗</a></article>
        <article><span>03</span><h3>Legacy context</h3><p>历史产品与代码仅提供兼容性背景。</p><a href={MOOD_TOKEN.officialSite} target="_blank" rel="noopener noreferrer">历史站点 ↗</a><br /><a href={MOOD_TOKEN.githubUrl} target="_blank" rel="noopener noreferrer">历史仓库 ↗</a></article>
      </section>

      <section className="mood-use" aria-labelledby="token-risk-title">
        <div className="mood-use-intro"><span className="mood-kicker">RISK NOTICE</span><h2 id="token-risk-title">风险提示</h2><p>该资产属于新上线或早期链上资产，流动性可能较浅，价格可能剧烈波动，并存在智能合约风险。操作前请独立核实合约、网络和交易路径。MOOD 不提供任何形式的回报保证。</p></div>
        <div className="mood-phase-card"><span>Canonical status</span><strong>Economic role unresolved</strong><p>Token ownership does not automatically establish contribution, reputation, rights, governance authority, or ownership of the network.</p></div>
      </section>

      <footer className="mood-footer"><Link className="mood-brand" href="/"><img src="/mood-logo.png" alt="" /><span>MOOD</span></Link><p>Contract existence is not protocol activation.</p><div><Link href="/">World</Link><Link href="/canon">Canon</Link><Link href="/transparency">Transparency</Link></div></footer>
    </main>
  );
}
