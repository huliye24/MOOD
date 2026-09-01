import Link from "next/link";

/**
 * /airdrop — MOOD Airdrop Claim Page.
 *
 * Status: VISIBLY DRAFT (refactor from MOOD Website Renaissance Pack 001).
 *
 * The previous implementation of this page rendered a fake claim flow with
 * simulated transaction receipts (e.g. blockNumber: 12345678). Per the
 * website principles and `MOOD_CANON.md` §14, that pattern is forbidden:
 *
 *  - No fake block numbers.
 *  - No fake "claimed" states.
 *  - No on-chain transactions without verifiable evidence.
 *  - No claim semantics until a canonical airdrop document is ratified.
 *
 * Per `AGENTS.md`:
 *
 *  > Never claim a contract, treasury, node, governance action, deployment,
 *  > token distribution, or production service is active without verifiable
 *  > evidence. Unverified or unresolved states must remain visibly unverified
 *  > or unresolved.
 *
 * Per `docs/website/website-principles.md`:
 *
 *  > If a page previously used any of these patterns, it must either:
 *  > 1. Be removed; or
 *  > 2. Be relabelled visibly as Draft / Planned / Future with the canonical
 *  >    source document linked.
 *
 * This file implements option 2. The page no longer:
 *  - Connects a wallet.
 *  - Submits a claim transaction.
 *  - Polls for a fake receipt.
 *  - Renders a success state.
 *
 * When a canonical airdrop document is ratified under `docs/protocol/AIRDROP.md`
 * and the corresponding smart contract is deployed and verified on-chain, this
 * page shall be rewritten to render the canonical document and the live
 * eligibility API.
 */

export const dynamic = "force-static";
export const revalidate = 300;

export const metadata = {
  title: "Airdrop | MOOD — Draft",
  description:
    "The MOOD airdrop claim surface is reserved until a canonical document is ratified and an on-chain distributor is deployed. This page is visibly Draft.",
  robots: { index: false, follow: false },
};

export default function AirdropPage() {
  return (
    <main className="airdrop-site">
      <nav className="airdrop-nav" aria-label="Airdrop navigation">
        <Link className="airdrop-brand" href="/">
          <img src="/favicon.svg" alt="" />
          <span>MOOD</span>
        </Link>
        <div>
          <Link href="/">World</Link>
          <Link href="/manifesto">Manifesto</Link>
          <Link href="/canon">Canon</Link>
          <Link href="/protocol">Protocol</Link>
          <Link href="/portal">Portal</Link>
          <span aria-current="page">Airdrop</span>
        </div>
      </nav>

      <header className="airdrop-hero">
        <p className="airdrop-kicker">PROTOCOL · AIRDROP · DRAFT</p>
        <h1>This page is not an active claim surface.</h1>
        <p className="airdrop-deck">
          The MOOD airdrop is reserved for a future phase that the Canon has not
          yet ratified. Until a canonical airdrop document exists and a verified
          on-chain distributor is deployed, no claim is open.
        </p>
        <div className="airdrop-status" role="status" aria-live="polite">
          <strong>Status</strong>
          <span>Draft · No active airdrop</span>
          <span>No claim form</span>
          <span>No simulated receipts</span>
          <span>No on-chain transactions</span>
        </div>
      </header>

      <section className="airdrop-section" aria-labelledby="why-draft">
        <h2 id="why-draft">Why this page is Draft</h2>
        <p>
          MOOD is currently in <strong>Phase Zero — Worldbuilding</strong>. Per
          <Link href="/canon"> MOOD Canon</Link>, the priority order is:
          <code>WORLD → CANON → CULTURE → PROTOCOL → SOFTWARE</code>. Token
          distribution and airdrop mechanics belong to a downstream phase that
          has not been authorised by the Canon.
        </p>
        <p>
          A claim surface that simulates success — even with a mock transaction
          receipt — fabricates evidence that does not exist. The website is
          therefore visibly Draft rather than pretending the airdrop is live.
        </p>
      </section>

      <section className="airdrop-section" aria-labelledby="what-was-removed">
        <h2 id="what-was-removed">What was removed in this refactor</h2>
        <p>
          The previous version of this page rendered a fake claim flow. The
          following patterns have been removed:
        </p>
        <ul>
          <li>
            A wallet connection UI that implied an active claim was possible.
          </li>
          <li>
            A simulated <code>eth_sendTransaction</code> with placeholder distributor
            configuration.
          </li>
          <li>
            A polling loop that produced a fake receipt with a hardcoded
            <code>blockNumber</code> and a mock success state.
          </li>
          <li>
            An &quot;Eligibility&quot; state that implied an active Merkle tree or participant set.
          </li>
        </ul>
        <p>
          These patterns violated <Link href="/canon">MOOD Canon</Link> §14 and
          <Link href="/canon"> AGENTS.md</Link> &quot;Safety and truth&quot;. They
          have been replaced with this Draft declaration.
        </p>
      </section>

      <section className="airdrop-section" aria-labelledby="what-is-needed">
        <h2 id="what-is-needed">What would need to be true for this page to open</h2>
        <ol>
          <li>
            A canonical document <code>docs/protocol/AIRDROP.md</code> ratified by
            a Canon amendment that defines allocation policy, eligibility source,
            and distribution mechanism.
          </li>
          <li>
            A deployed and verified on-chain distributor contract, with a public
            address and an explorer link that resolves to deployed bytecode.
          </li>
          <li>
            A public eligibility source (Merkle root or equivalent) anchored to
            an auditable participant registry (e.g. Genesis Participants).
          </li>
          <li>
            A human approval gate (per AGENTS.md) before any claim UI is enabled.
          </li>
        </ol>
        <p>
          Until all four conditions are met, this page remains Draft.
        </p>
      </section>

      <section className="airdrop-section" aria-labelledby="related-docs">
        <h2 id="related-docs">Related canonical and operational documents</h2>
        <ul>
          <li>
            <Link href="/canon">MOOD Canon</Link> — §12 (The Token Is Downstream), §14 (Canonical Change).
          </li>
          <li>
            <Link href="/protocol">Protocol</Link> — rule layer; the airdrop, if
            any, would live here.
          </li>
          <li>
            <Link href="/portal">Portal</Link> — reserved surface for future
            participation (also Draft).
          </li>
          <li>
            <code>docs/mood/token/</code> — operational token records (not part of
            the public website surface).
          </li>
          <li>
            <code>docs/mood/genesis/</code> — Genesis Participant registry (Phase Zero
            Draft).
          </li>
        </ul>
      </section>

      <footer className="airdrop-footer">
        <Link className="airdrop-brand" href="/">
          <img src="/favicon.svg" alt="" />
          <span>MOOD</span>
        </Link>
        <p>Airdrop · Draft · Renders only what the Canon authorises.</p>
        <div>
          <Link href="/canon">Canon</Link>
          <Link href="/protocol">Protocol</Link>
          <a href="https://github.com/huliye24/MOOD" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </footer>
    </main>
  );
}
