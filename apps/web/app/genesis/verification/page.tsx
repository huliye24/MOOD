import type { Metadata } from "next";
import Link from "next/link";
import { GENESIS_VERIFICATION } from "../../../lib/genesis-verification";

export const metadata: Metadata = {
  title: "Genesis Verification · MOOD",
  description: "MOOD first Genesis state verification and reproducible public evidence.",
};

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };

export default function GenesisVerificationPage() {
  const record = GENESIS_VERIFICATION;
  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 75% 8%, rgba(86,92,210,.18), transparent 28%), linear-gradient(135deg, #070a22, #040719 70%)", color: "var(--text)", padding: "0 clamp(20px, 4vw, 64px) var(--space-12)" }}>
      <nav aria-label="位置" style={{ paddingBlock: "var(--space-6)", color: "var(--text-faint)", fontSize: "var(--text-sm)" }}>
        <Link href="/genesis" style={{ color: "inherit", textDecoration: "none" }}>← 返回 Genesis</Link>
      </nav>

      <header style={{ display: "grid", gap: "var(--space-4)", paddingBlock: "var(--space-12) var(--space-8)", maxWidth: 880 }}>
        <span style={{ fontSize: "var(--text-xs)", letterSpacing: "0.18em", color: "var(--text-faint)", textTransform: "uppercase" }}>Public Memory · Verification 001</span>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", lineHeight: "var(--leading-tight)" }}>第一次 Genesis 验证</h1>
        <p style={{ margin: 0, maxWidth: "58ch", color: "var(--text-muted)", fontSize: "var(--text-lg)", lineHeight: "var(--leading-normal)" }}>
          这是 MOOD 首次 Genesis 状态的公开完整性记录。任何人都可以下载源文件并独立重新计算 SHA-256。
        </p>
      </header>

      <section aria-label="验证结果" style={{ display: "grid", gap: "var(--space-6)", maxWidth: 880, padding: "var(--space-8)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", background: "var(--surface-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <span aria-hidden style={{ width: 10, height: 10, borderRadius: "50%", background: "#5fe0a1" }} />
          <strong>VERIFIED · 已验证</strong>
          <span style={{ color: "var(--text-faint)" }}>Off-chain integrity record</span>
        </div>
        <dl style={{ margin: 0, display: "grid", gap: "var(--space-5)" }}>
          <div><dt style={{ color: "var(--text-faint)", fontSize: "var(--text-sm)" }}>Genesis ID</dt><dd style={{ ...mono, margin: "var(--space-2) 0 0", overflowWrap: "anywhere" }}>{record.id}</dd></div>
          <div><dt style={{ color: "var(--text-faint)", fontSize: "var(--text-sm)" }}>SHA-256</dt><dd style={{ ...mono, margin: "var(--space-2) 0 0", overflowWrap: "anywhere" }}>{record.sha256}</dd></div>
          <div><dt style={{ color: "var(--text-faint)", fontSize: "var(--text-sm)" }}>Generated</dt><dd style={{ ...mono, margin: "var(--space-2) 0 0" }}>{record.generatedAt}</dd></div>
        </dl>
        <div>
          <h2 style={{ margin: "0 0 var(--space-3)", fontFamily: "var(--font-display)", fontSize: "var(--text-xl)" }}>哈希范围</h2>
          <ul style={{ ...mono, margin: 0, paddingInlineStart: "var(--space-6)", color: "var(--text-muted)", lineHeight: 1.8 }}>
            {record.scope.map((file) => <li key={file}>{file}</li>)}
          </ul>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <a href={record.githubRecord} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", padding: "10px 16px", border: "1px solid var(--line)", borderRadius: "var(--radius-pill)", color: "var(--text)", textDecoration: "none" }}>查看 GitHub 公共记录 ↗</a>
          <a href={record.githubHash} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", padding: "10px 16px", border: "1px solid var(--line)", borderRadius: "var(--radius-pill)", color: "var(--text)", textDecoration: "none" }}>查看哈希文件 ↗</a>
        </div>
      </section>

      <section aria-label="证明边界" style={{ maxWidth: 880, marginTop: "var(--space-6)", padding: "var(--space-6)", border: "1px solid var(--attention)", borderLeft: "3px solid var(--attention)", borderRadius: "var(--radius-md)", background: "var(--attention-soft)", color: "var(--text-muted)", lineHeight: "var(--leading-normal)" }}>
        <strong style={{ color: "var(--text)" }}>证明边界：</strong>该结果证明公开的五个 Genesis 文件能够重现上述哈希。它不是上链锚定、第三方公证、Token 激活或生产协议已部署的声明。
      </section>
    </main>
  );
}
