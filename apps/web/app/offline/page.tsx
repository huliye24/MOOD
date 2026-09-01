"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="public-track">
      <Link href="/">← MOOD</Link>
      <article>
        <div className="hero-vinyl"><div className="vinyl"><img src="/favicon.svg" alt="MOOD" /><i /></div></div>
        <span className="eyebrow">OFFLINE</span>
        <h1>当前没有网络连接</h1>
        <p className="result-note">网络入口当前离线，实时协议状态与参与功能需要网络。
          恢复连接后请刷新页面，我们会从服务器重新读取状态。</p>
        <p className="result-note">此处不会展示未经验证的缓存网络状态。</p>
      </article>
    </main>
  );
}
