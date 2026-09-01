import Link from "next/link";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * /portal — Future participation entrance.
 *
 * Status: VISIBLY DRAFT.
 *
 * This route does not host active participation flows. It exists to hold the
 * place for future identity, passport, and participation surfaces that the
 * Canon has not yet ratified.
 *
 * Per [`docs/website/website-principles.md`](../../../../docs/website/website-principles.md):
 *  - Unverified or unresolved states must remain visibly unverified or unresolved.
 *  - The website must not invent metrics, users, treasury, or governance activity.
 *  - The Portal section must not present active participation flows, live counters,
 *    simulated claim states, or on-chain transactions until the corresponding
 *    canonical document authorises them.
 *
 * Per [`docs/website/content-mapping.md`](../../../../docs/website/content-mapping.md):
 *  - Until `docs/portal/` is populated with canonical documents, the `/portal`
 *    route must remain visibly Draft.
 *
 * If a future canonical document under `docs/portal/` exists, this page shall
 * render it directly (Markdown is canonical memory; the website is a renderer).
 */

const CANONICAL_PORTAL_SOURCES = [
  {
    label: "MOOD Canon §7 — The Website Is an Entrance, Not the World",
    href: "/canon",
    note: "Establishes that the website renders the world but is not the world.",
  },
  {
    label: "docs/protocol/passport.md",
    href: "/protocol/passport",
    note: "Identity and Passport concept (Draft / evolving).",
  },
  {
    label: "docs/protocol/verification.md",
    href: "/protocol/verification",
    note: "Verification flow concept (Draft / evolving).",
  },
  {
    label: "docs/protocol/agent.md",
    href: "/protocol/agent",
    note: "Agent concept (Draft / evolving).",
  },
  {
    label: "docs/website/website-principles.md",
    href: "/canon",
    note: "Forbidden patterns on the website, including fake participation flows.",
  },
] as const;

async function loadCanonicalPortalIndex(): Promise<{ body: string | null; sourcePath: string | null }> {
  const candidates = [
    path.join(process.cwd(), "docs", "portal", "README.md"),
    path.join(process.cwd(), "..", "..", "docs", "portal", "README.md"),
    path.join(process.cwd(), "..", "docs", "portal", "README.md"),
  ];
  for (const candidate of candidates) {
    try {
      const body = await fs.readFile(candidate, "utf8");
      return { body, sourcePath: candidate };
    } catch {
      // try the next candidate
    }
  }
  return { body: null, sourcePath: null };
}

export const dynamic = "force-static";
export const revalidate = 300;

export const metadata = {
  title: "Portal | MOOD — Draft",
  description:
    "MOOD Portal is reserved for future participation surfaces. This page is visibly Draft until a canonical document under docs/portal/ exists.",
  robots: { index: false, follow: false },
};

export default async function PortalPage() {
  const { body, sourcePath } = await loadCanonicalPortalIndex();

  return (
    <main className="portal-site">
      <nav className="portal-nav" aria-label="Portal navigation">
        <Link className="portal-brand" href="/">
          <img src="/favicon.svg" alt="" />
          <span>MOOD</span>
        </Link>
        <div>
          <Link href="/">World</Link>
          <Link href="/manifesto">Manifesto</Link>
          <Link href="/canon">Canon</Link>
          <Link href="/library">Library</Link>
          <Link href="/protocol">Protocol</Link>
          <span aria-current="page">Portal</span>
        </div>
      </nav>

      <header className="portal-hero">
        <p className="portal-kicker">PROTOCOL · PORTAL</p>
        <h1>The Portal is not yet open.</h1>
        <p className="portal-deck">
          This route is reserved for future identity, passport, and participation
          surfaces. It exists to hold the place — not to host live flows.
        </p>
        <div className="portal-status" role="status" aria-live="polite">
          <strong>Status</strong>
          <span>Draft · No active participation flows</span>
          <span>No live counters</span>
          <span>No simulated on-chain activity</span>
        </div>
      </header>

      <section className="portal-section" aria-labelledby="why-draft">
        <h2 id="why-draft">Why this page is Draft</h2>
        <p>
          The Canon defines the world; it does not yet define a public participation
          portal. Until a canonical document is ratified under
          <code>docs/portal/</code>, this route must not pretend that participation
          is open. Doing so would fabricate users, treasury, or governance activity
          that does not exist.
        </p>
        <p>
          Per <Link href="/canon">MOOD Canon</Link> §7 and the website principles, the
          Portal section renders only what the Canon authorises. Today it authorises
          a draft placeholder.
        </p>
      </section>

      <section className="portal-section" aria-labelledby="what-portal-is">
        <h2 id="what-portal-is">What the Portal will eventually be</h2>
        <ul>
          <li>Identity and Passport surface — anchored in <code>docs/protocol/passport.md</code>.</li>
          <li>Verification surface — anchored in <code>docs/protocol/verification.md</code>.</li>
          <li>Agent surface — anchored in <code>docs/protocol/agent.md</code>.</li>
          <li>Future participation surfaces — only after Canon amendment.</li>
        </ul>
        <p>
          Each of these will become a real route when the corresponding canonical
          document is added to <code>docs/portal/</code> and the website is updated
          to render it directly.
        </p>
      </section>

      <section className="portal-section" aria-labelledby="what-portal-is-not">
        <h2 id="what-portal-is-not">What this page is not</h2>
        <ul>
          <li>
            <strong>Not an airdrop claim.</strong> No claim button. No simulated
            receipt. No block number. No MOOD transfer. Claim semantics belong in a
            future <code>docs/protocol/AIRDROP.md</code> ratified by Canon amendment.
          </li>
          <li>
            <strong>Not a wallet gate.</strong> Connecting a wallet on this page
            would imply a live flow. Until the Canon authorises it, the page does
            not request wallet connection.
          </li>
          <li>
            <strong>Not a counter.</strong> No participant numbers. No resident
            counts. No treasury balances. Anything claimed otherwise is
            unverified.
          </li>
          <li>
            <strong>Not a marketing surface.</strong> The Portal is the future
            participation entrance. Marketing belongs on the World and Manifesto
            routes.
          </li>
        </ul>
      </section>

      <section className="portal-section" aria-labelledby="canonical-sources">
        <h2 id="canonical-sources">Canonical sources this route defers to</h2>
        <ol>
          {CANONICAL_PORTAL_SOURCES.map((entry) => (
            <li key={entry.label}>
              <Link href={entry.href}>{entry.label}</Link>
              <p>{entry.note}</p>
            </li>
          ))}
        </ol>
      </section>

      {body && sourcePath ? (
        <section className="portal-section portal-section-canonical" aria-labelledby="portal-canonical-doc">
          <h2 id="portal-canonical-doc">Canonical portal document</h2>
          <p>
            Rendering <code>{sourcePath.replace(process.cwd(), ".") || sourcePath}</code> directly.
            If this document is a Draft, the page is a Draft.
          </p>
          <pre className="portal-canonical-body">{body}</pre>
        </section>
      ) : (
        <section className="portal-section portal-section-canonical" aria-labelledby="portal-canonical-doc">
          <h2 id="portal-canonical-doc">Canonical portal document</h2>
          <p>
            No canonical document was found at <code>docs/portal/README.md</code>.
            Per the website principles, the Portal route is therefore visibly Draft.
            When the first canonical document lands, this page will render it
            directly.
          </p>
        </section>
      )}

      <footer className="portal-footer">
        <Link className="portal-brand" href="/">
          <img src="/favicon.svg" alt="" />
          <span>MOOD</span>
        </Link>
        <p>Portal · Draft · Renders only what the Canon authorises.</p>
        <div>
          <Link href="/canon">Canon</Link>
          <Link href="/library">Library</Link>
          <a href="https://github.com/huliye24/MOOD" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </footer>
    </main>
  );
}
