import Link from "next/link";

const editions = [
  { version: "v0.1", era: "GENESIS I", title: "贡献成为价值的起点", text: "贡献挑战身份、资本与平台对价值的垄断。", href: "/manifesto/moodism/v0.1" },
  { version: "v0.2", era: "GENESIS II", title: "人的尊严先于贡献", text: "基本人权不需要赚取；尊严限制贡献制度的权力。", href: "/manifesto/moodism/v0.2" },
  { version: "v0.3", era: "GENESIS III", title: "共同世界仍在生成", text: "尊严、自由与贡献共同生成一个多元的公共世界。", href: "/manifesto/moodism" },
] as const;

export function MoodismArc({ current = "v0.3" }: { current?: string }) {
  return (
    <section className="moodism-arc" aria-labelledby="moodism-arc-title">
      <div className="moodism-arc-heading">
        <span>THE INTELLECTUAL ARC</span>
        <h2 id="moodism-arc-title">思想不是被替换，<br />而是一层层留下。</h2>
        <p>每一版都保留当时的确信、盲点与后来出现的约束。新的光从旧的地层中生长，但不会抹掉来路。</p>
      </div>
      <div className="moodism-arc-track" role="list" aria-label="MOODISM Manifesto versions">
        {editions.map((edition, index) => (
          <Link className="moodism-era" data-current={edition.version === current ? "true" : "false"} data-era={index + 1} href={edition.href} key={edition.version} role="listitem">
            <div className="moodism-era-meta"><span>{edition.version}</span><small>{edition.era}</small></div>
            <div className="moodism-era-copy"><h3>{edition.title}</h3><p>{edition.text}</p></div>
            <strong>{edition.version === current ? "当前阅读版" : "回到这一层"} →</strong>
          </Link>
        ))}
      </div>
      <div className="moodism-arc-note"><span>01</span><p>贡献使价值被看见</p><span>02</span><p>尊严为制度划定底线</p><span>03</span><p>自由让共同世界值得生成</p></div>
    </section>
  );
}
