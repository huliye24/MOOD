import Link from "next/link";
import ReactMarkdown from "react-markdown";
import content from "./content.json";

const sections = [
  "Motivation and Historical Context",
  "Design Objectives and Non-Goals",
  "System Overview",
  "MOOD as a State Transition System",
  "Identity and Passport",
  "Tasks, Contributions and Proof",
  "Reputation and Rights",
  "AI Agents as First-Class Participants",
  "Nodes and Network Resources",
  "Protocol Modules",
  "Economic Layer and MOOD",
  "Governance and Treasury",
  "Chain Architecture and Data Availability",
  "Security and Adversarial Model",
  "Scalability and Modularity",
  "WORLD and PORTAL as the Network Interface",
  "Genesis Application: Moodify",
  "Application Classes",
  "Roadmap and Network Metrics",
  "Open Questions",
  "Conclusion",
];

const slugify = (value: string) => value
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")
  .trim()
  .replace(/\s+/g, "-");

const paperBody = content.markdown.slice(
  content.markdown.indexOf("## Machine-Readable Canon Notes"),
);

export default function WhitepaperPage() {
  return (
    <main className="whitepaper-site">
      <nav className="whitepaper-nav" aria-label="MOOD whitepaper navigation">
        <Link className="whitepaper-brand" href="/token">
          <img src="/moodify-brand-logo.png" alt="" />
          <span>MOOD</span>
        </Link>
        <div>
          <Link href="/token">World</Link>
          <a href="#paper">Whitepaper</a>
          <a className="whitepaper-download" href="/whitepaper/raw" download="MOOD_English_Whitepaper_v0.1.md">Download Markdown</a>
        </div>
      </nav>

      <header className="whitepaper-hero">
        <p>MOOD · PROTOCOL PAPER · VERSION 0.1</p>
        <h1>An Open Coordination Protocol and Digital World for Human and Machine Agency</h1>
        <p className="whitepaper-deck">Identity · Contribution · Proof · Reputation · Agents · Nodes · Governance · Settlement</p>
        <div className="whitepaper-status">
          <strong>Design specification</strong>
          <span>August 2026</span>
          <span>English</span>
          <span>Machine-readable edition</span>
        </div>
        <p className="whitepaper-notice">This paper defines architecture and protocol intent. It does not by itself prove that a feature, contract, network, treasury or governance process is live.</p>
      </header>

      <div className="whitepaper-shell" id="paper">
        <aside className="whitepaper-toc" aria-label="Table of contents">
          <span>CONTENTS</span>
          <ol>
            {sections.map((section, index) => (
              <li key={section}><a href={`#${slugify(`${index + 1}-${section}`)}`}>{section}</a></li>
            ))}
          </ol>
        </aside>

        <article className="whitepaper-article">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 id={slugify(String(children))}>{children}</h1>,
              h2: ({ children }) => <h2 id={slugify(String(children))}>{children}</h2>,
              h3: ({ children }) => <h3 id={slugify(String(children))}>{children}</h3>,
            }}
          >
            {paperBody}
          </ReactMarkdown>
        </article>
      </div>

      <footer className="whitepaper-footer">
        <Link className="whitepaper-brand" href="/token"><img src="/moodify-brand-logo.png" alt="" /><span>MOOD</span></Link>
        <p>MOOD is the world. Moodify is only the beginning.</p>
        <a href="https://github.com/huliye24/MOOD" target="_blank" rel="noreferrer">GitHub ↗</a>
      </footer>
    </main>
  );
}
