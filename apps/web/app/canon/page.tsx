import { promises as fs } from "node:fs";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

/**
 * /canon — the MOOD Canon public entrance.
 *
 * MOOD_CANON.md at the repository root is the highest conceptual authority
 * for the project (per AGENTS.md). This page renders that file directly so
 * Markdown remains the source of truth and no duplication lives inside React.
 *
 * The page is a Server Component: it reads the file from disk at request
 * time. If the canonical file is missing or unreadable, the page fails open
 * as visibly unverified rather than fabricating Canon text.
 */

const CANON_FILE = "MOOD_CANON.md";

async function loadCanon(): Promise<{ body: string; sourcePath: string } | { error: string }> {
  const envOverride = process.env.MOOD_CANON_PATH;
  const candidates = envOverride
    ? [envOverride]
    : [
        path.join(process.cwd(), CANON_FILE),
        path.join(process.cwd(), "..", "..", CANON_FILE),
        path.join(process.cwd(), "..", CANON_FILE),
        path.join(process.cwd(), "..", "..", "..", CANON_FILE),
      ];
  const tried: string[] = [];
  for (const candidate of candidates) {
    tried.push(candidate);
    try {
      const body = await fs.readFile(candidate, "utf8");
      return { body, sourcePath: candidate };
    } catch {
      // try the next candidate
    }
  }
  return {
    error: `MOOD_CANON.md not found. Tried: ${tried.join(" | ")}`,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const slugOverrides: Record<string, string> = {
  "1. The Prime Rule": "1-the-prime-rule",
  "2. What MOOD Is": "2-what-mood-is",
  "3. The World Comes Before the System": "3-the-world-comes-before-the-system",
  "4. Canon Is the Source of Authority": "4-canon-is-the-source-of-authority",
  "5. Markdown as Canonical Memory": "5-markdown-as-canonical-memory",
  "6. The Canonical Layers": "6-the-canonical-layers",
  "6.1 World": "6-1-world",
  "6.2 Constitution": "6-2-constitution",
  "6.3 Culture": "6-3-culture",
  "6.4 Protocol": "6-4-protocol",
  "6.5 Economy": "6-5-economy",
  "6.6 Software": "6-6-software",
  "7. The Website Is an Entrance, Not the World": "7-the-website-is-an-entrance-not-the-world",
  "8. Code Must Earn the Right to Exist": "8-code-must-earn-the-right-to-exist",
  "9. Canon-First Agent Law": "9-canon-first-agent-law",
  "10. Existing Code Has No Automatic Authority": "10-existing-code-has-no-automatic-authority",
  "11. MOOD and Moodify Are Separate": "11-mood-and-moodify-are-separate",
  "12. The Token Is Downstream": "12-the-token-is-downstream",
  "13. Canonical Documents Should Be Small Enough to Think With": "13-canonical-documents-should-be-small-enough-to-think-with",
  "14. Canonical Change": "14-canonical-change",
  "15. Phase Zero: Worldbuilding": "15-phase-zero-worldbuilding",
  "16. The Standard for Progress": "16-the-standard-for-progress",
  "17. The Foundational Principle": "17-the-foundational-principle",
  "18. Closing Declaration": "18-closing-declaration",
};

function extractHeadings(markdown: string): { level: 1 | 2 | 3; text: string; id: string }[] {
  const headings: { level: 1 | 2 | 3; text: string; id: string }[] = [];
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  for (const line of lines) {
    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const levelRaw = match[1].length;
    const text = match[2].trim();
    if (levelRaw > 3) continue;
    const overrideKey = Object.keys(slugOverrides).find((key) => text.startsWith(key));
    const id = overrideKey ? slugOverrides[overrideKey] : slugify(text);
    headings.push({ level: levelRaw as 1 | 2 | 3, text, id });
  }
  return headings;
}

export const dynamic = "force-static";
export const revalidate = 300;

export async function generateMetadata() {
  return {
    title: "MOOD Canon · The World Before the System",
    description:
      "The MOOD Canon defines the world from which the system may be built. It is the highest conceptual authority of the project.",
    alternates: { canonical: "/canon" },
    openGraph: {
      title: "MOOD Canon · The World Before the System",
      description:
        "World before system. Meaning before mechanism. Canon before code.",
      type: "article",
    },
  };
}

export default async function CanonPage() {
  const loaded = await loadCanon();

  if ("error" in loaded) {
    return (
      <main className="canon-site">
        <nav className="canon-nav" aria-label="Canon navigation">
          <Link className="canon-brand" href="/token">
            <img src="/moodify-brand-logo.png" alt="" />
            <span>MOOD</span>
          </Link>
          <div>
            <Link href="/token">World</Link>
            <span aria-current="page">Canon</span>
            <a className="canon-download" href="/canon/raw" download="MOOD_CANON.md">Download Markdown</a>
          </div>
        </nav>
        <section className="canon-error">
          <h1>MOOD Canon — visibly unverified</h1>
          <p>
            The canonical file <code>MOOD_CANON.md</code> could not be read from disk.
            The Canon must remain the source of truth; this page therefore fails open
            as unverified rather than fabricating text.
          </p>
          <pre>{loaded.error}</pre>
          <p>
            Set <code>MOOD_CANON_PATH</code> or restore <code>MOOD_CANON.md</code> at the
            repository root.
          </p>
        </section>
      </main>
    );
  }

  const { body, sourcePath } = loaded;
  const headings = extractHeadings(body).filter((h) => h.level >= 2);

  return (
    <main className="canon-site">
      <nav className="canon-nav" aria-label="Canon navigation">
        <Link className="canon-brand" href="/token">
          <img src="/moodify-brand-logo.png" alt="" />
          <span>MOOD</span>
        </Link>
        <div>
          <Link href="/token">World</Link>
          <span aria-current="page">Canon</span>
          <a className="canon-download" href="/canon/raw" download="MOOD_CANON.md">Download Markdown</a>
        </div>
      </nav>

      <header className="canon-hero">
        <p>MOOD · CANON · VERSION 0.1</p>
        <h1>The World Before the System</h1>
        <p className="canon-deck">
          The MOOD Canon defines the highest-level conceptual and developmental order
          of the project. Markdown is its primary memory.
        </p>
        <div className="canon-status">
          <strong>Source of truth</strong>
          <span>{sourcePath.replace(process.cwd(), ".") || sourcePath}</span>
          <span>Phase Zero · Worldbuilding</span>
        </div>
        <p className="canon-notice">
          This page renders <code>MOOD_CANON.md</code> directly. The Canon defines
          the world; the system follows. This is not a proof of any deployment,
          contract, treasury, node or governance action.
        </p>
      </header>

      <div className="canon-shell">
        <aside className="canon-toc" aria-label="Table of contents">
          <span>CONTENTS</span>
          <ol>
            {headings.map((heading) => (
              <li key={heading.id} data-level={heading.level}>
                <a href={`#${heading.id}`}>{heading.text}</a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="canon-article">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 id={slugify(String(children))}>{children}</h1>,
              h2: ({ children }) => {
                const text = String(children);
                const overrideKey = Object.keys(slugOverrides).find((key) => text.startsWith(key));
                const id = overrideKey ? slugOverrides[overrideKey] : slugify(text);
                return <h2 id={id}>{children}</h2>;
              },
              h3: ({ children }) => {
                const text = String(children);
                const overrideKey = Object.keys(slugOverrides).find((key) => text.startsWith(key));
                const id = overrideKey ? slugOverrides[overrideKey] : slugify(text);
                return <h3 id={id}>{children}</h3>;
              },
            }}
          >
            {body}
          </ReactMarkdown>
        </article>
      </div>

      <footer className="canon-footer">
        <Link className="canon-brand" href="/token">
          <img src="/moodify-brand-logo.png" alt="" />
          <span>MOOD</span>
        </Link>
        <p>The Canon is where MOOD begins.</p>
        <a href="https://github.com/huliye24/MOOD" target="_blank" rel="noreferrer">GitHub ↗</a>
      </footer>
    </main>
  );
}
