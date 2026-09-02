/**
 * /genesis — MOOD Genesis Explorer
 * 
 * Displays the MOOD Network genesis state: the first verifiable contribution,
 * proof, and reputation that established the network.
 * 
 * This page is the canonical entrance to MOOD's genesis record.
 * It reads directly from the genesis/ JSON files in the repository.
 * 
 * No token, no wallet, no transaction. Purely a readable record.
 */

import Link from "next/link";
import fs from "fs";
import path from "path";

const GENESIS_DIR = path.join(process.cwd(), "..", "..", "genesis");

interface GenesisContributor {
  id: string;
  name: string;
  type: string;
  contribution: string;
}

interface GenesisContribution {
  id: string;
  contributor_id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  proof_ids: string[];
  created_at: string;
}

interface GenesisProof {
  id: string;
  contribution: string;
  type: string;
  verification_method: string;
  status: string;
  evidence: {
    source: string;
    timestamp?: string;
    reference?: string;
    repository?: string;
  };
}

interface GenesisReputation {
  contributor: string;
  score: number;
  level: string;
  reason: string;
  contribution_type: string;
  verification: string;
}

function loadGenesis<T>(filename: string): T | null {
  try {
    const content = fs.readFileSync(path.join(GENESIS_DIR, filename), "utf8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export default function GenesisExplorerPage() {
  const contributors = loadGenesis<{ contributors: GenesisContributor[] }>("contributors.json");
  const contributions = loadGenesis<{ contributions: GenesisContribution[] }>("contributions.json");
  const proofs = loadGenesis<{ proofs: GenesisProof[] }>("genesis-proofs.json");
  const reputations = loadGenesis<{ reputations: GenesisReputation[] }>("genesis-reputation.json");
  const network = loadGenesis<{ network: string; version: string; phase: string }>("genesis.json");

  const genesisContributor = contributors?.contributors?.[0] ?? null;
  const genesisContribution = contributions?.contributions?.[0] ?? null;
  const genesisProof = proofs?.proofs?.[0] ?? null;
  const genesisReputation = reputations?.reputations?.find(
    r => r.contributor === "genesis_001" || r.contributor === "genesis_founder"
  ) ?? null;

  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 70% 12%, rgba(36,66,154,.17), transparent 27%), linear-gradient(135deg, #070a22, #040719 70%)",
      padding: "0 clamp(20px, 4vw, 64px) var(--space-12)"
    }}>
      {/* Navigation */}
      <nav aria-label="Location" style={{
        paddingBlock: "var(--space-6)",
        color: "var(--text-faint)",
        fontSize: "var(--text-sm)"
      }}>
        <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
          ← 返回 MOOD
        </Link>
      </nav>

      {/* Header */}
      <header style={{
        display: "grid",
        gap: "var(--space-4)",
        paddingBlock: "var(--space-12) var(--space-8)",
        maxWidth: 760
      }}>
        <span style={{
          fontSize: "var(--text-xs)",
          letterSpacing: "0.18em",
          color: "var(--text-faint)",
          textTransform: "uppercase"
        }}>
          Protocol · Genesis · v0.1
        </span>
        <h1 style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-4xl)",
          lineHeight: "var(--leading-tight)",
          letterSpacing: "-0.01em",
          color: "var(--text)"
        }}>
          MOOD Genesis
        </h1>
        <p style={{
          margin: 0,
          fontSize: "var(--text-lg)",
          color: "var(--text-muted)",
          maxWidth: "52ch",
          lineHeight: "var(--leading-normal)"
        }}>
          The first verifiable state of the MOOD Network. Not a token launch — a contribution record.
        </p>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "var(--space-3)"
        }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-1) var(--space-4)",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--line)",
            background: "var(--surface-subtle)",
            fontSize: "var(--text-sm)",
            color: "var(--text)"
          }}>
            <span aria-hidden style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--brand-violet)",
              flex: "none"
            }} />
            {network?.network ?? "MOOD"} · {network?.version ?? "v0.1.0"}
          </span>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-faint)" }}>
            Phase: {network?.phase ?? "genesis"}
          </span>
        </div>
      </header>

      {/* Genesis Principle */}
      <section aria-label="Genesis principle" style={{
        display: "grid",
        gap: "var(--space-3)",
        maxWidth: 760,
        padding: "var(--space-6)",
        border: "1px solid var(--evidence)",
        borderLeft: "3px solid var(--evidence)",
        borderRadius: "var(--radius-md)",
        background: "var(--evidence-soft)",
        marginBottom: "var(--space-8)"
      }}>
        <h2 style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xl)",
          color: "var(--text)"
        }}>
          The Genesis Principle
        </h2>
        <p style={{
          margin: 0,
          fontSize: "var(--text-md)",
          color: "var(--text-muted)",
          lineHeight: "var(--leading-normal)"
        }}>
          MOOD does not begin with a token. MOOD begins with contribution.
          The genesis state is the first moment when the MOOD Protocol's
          three core systems — Contribution Registry, Proof Engine, and
          Reputation Engine — produced verifiable records simultaneously.
        </p>
      </section>

      {/* Verification Chain */}
      <section aria-label="Verification chain" style={{
        display: "grid",
        gap: "var(--space-6)",
        maxWidth: 760,
        marginBottom: "var(--space-8)"
      }}>
        <h2 style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-2xl)",
          color: "var(--text)"
        }}>
          The Verification Chain
        </h2>

        {/* Step 1: Contribution */}
        <article aria-label="Genesis Contribution" style={{
          display: "grid",
          gap: "var(--space-4)",
          padding: "var(--space-6)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-subtle)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--brand-violet)",
              color: "white",
              fontSize: "var(--text-sm)",
              fontWeight: "bold",
              flex: "none"
            }}>1</span>
            <span style={{
              fontSize: "var(--text-xs)",
              letterSpacing: "0.18em",
              color: "var(--text-faint)",
              textTransform: "uppercase"
            }}>
              Contribution Registry
            </span>
          </div>
          {genesisContribution ? (
            <dl style={{ margin: 0, display: "grid", gap: "var(--space-3)" }}>
              <div style={{ display: "grid", gap: "var(--space-1)" }}>
                <dt style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase"
                }}>Title</dt>
                <dd style={{ margin: 0, fontSize: "var(--text-lg)", color: "var(--text)", fontWeight: 500 }}>
                  {genesisContribution.title}
                </dd>
              </div>
              <div style={{ display: "grid", gap: "var(--space-1)" }}>
                <dt style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase"
                }}>Type</dt>
                <dd style={{ margin: 0, fontSize: "var(--text-md)", color: "var(--text)" }}>
                  <code style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                    background: "var(--bg)",
                    padding: "var(--space-1) var(--space-2)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "var(--text-sm)"
                  }}>
                    {genesisContribution.type}
                  </code>
                </dd>
              </div>
              <div style={{ display: "grid", gap: "var(--space-1)" }}>
                <dt style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase"
                }}>Description</dt>
                <dd style={{ margin: 0, fontSize: "var(--text-md)", color: "var(--text-muted)", lineHeight: "var(--leading-normal)" }}>
                  {genesisContribution.description}
                </dd>
              </div>
              <div style={{ display: "grid", gap: "var(--space-1)" }}>
                <dt style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase"
                }}>Status</dt>
                <dd style={{ margin: 0 }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-1) var(--space-3)",
                    borderRadius: "var(--radius-pill)",
                    background: "rgba(34, 197, 94, 0.12)",
                    color: "#22c55e",
                    fontSize: "var(--text-sm)"
                  }}>
                    <span aria-hidden style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#22c55e"
                    }} />
                    {genesisContribution.status}
                  </span>
                </dd>
              </div>
              <div style={{ display: "grid", gap: "var(--space-1)" }}>
                <dt style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase"
                }}>Contribution ID</dt>
                <dd style={{ margin: 0 }}>
                  <code style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                    fontSize: "var(--text-sm)",
                    color: "var(--text)",
                    background: "var(--bg)",
                    padding: "var(--space-1) var(--space-2)",
                    borderRadius: "var(--radius-sm)"
                  }}>
                    {genesisContribution.id}
                  </code>
                </dd>
              </div>
            </dl>
          ) : (
            <p style={{ margin: 0, color: "var(--text-faint)" }}>Loading...</p>
          )}
        </article>

        {/* Arrow */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          color: "var(--text-faint)"
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 3v14M10 17l4-4M10 17l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Step 2: Proof */}
        <article aria-label="Genesis Proof" style={{
          display: "grid",
          gap: "var(--space-4)",
          padding: "var(--space-6)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-subtle)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--brand-violet)",
              color: "white",
              fontSize: "var(--text-sm)",
              fontWeight: "bold",
              flex: "none"
            }}>2</span>
            <span style={{
              fontSize: "var(--text-xs)",
              letterSpacing: "0.18em",
              color: "var(--text-faint)",
              textTransform: "uppercase"
            }}>
              Proof Engine
            </span>
          </div>
          {genesisProof ? (
            <dl style={{ margin: 0, display: "grid", gap: "var(--space-3)" }}>
              <div style={{ display: "grid", gap: "var(--space-1)" }}>
                <dt style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase"
                }}>Proof ID</dt>
                <dd style={{ margin: 0 }}>
                  <code style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                    fontSize: "var(--text-sm)",
                    color: "var(--text)"
                  }}>
                    {genesisProof.id}
                  </code>
                </dd>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div style={{ display: "grid", gap: "var(--space-1)" }}>
                  <dt style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-faint)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase"
                  }}>Method</dt>
                  <dd style={{ margin: 0, fontSize: "var(--text-md)", color: "var(--text)" }}>
                    {genesisProof.verification_method}
                  </dd>
                </div>
                <div style={{ display: "grid", gap: "var(--space-1)" }}>
                  <dt style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-faint)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase"
                  }}>Type</dt>
                  <dd style={{ margin: 0, fontSize: "var(--text-md)", color: "var(--text)" }}>
                    {genesisProof.type}
                  </dd>
                </div>
              </div>
              <div style={{ display: "grid", gap: "var(--space-1)" }}>
                <dt style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase"
                }}>Evidence Source</dt>
                <dd style={{ margin: 0, fontSize: "var(--text-md)", color: "var(--text)" }}>
                  {genesisProof.evidence.source}
                  {genesisProof.evidence.repository && (
                    <span style={{ color: "var(--text-faint)", marginLeft: "var(--space-2)" }}>
                      / {genesisProof.evidence.repository}
                    </span>
                  )}
                </dd>
              </div>
              <div style={{ display: "grid", gap: "var(--space-1)" }}>
                <dt style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase"
                }}>Status</dt>
                <dd style={{ margin: 0 }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-1) var(--space-3)",
                    borderRadius: "var(--radius-pill)",
                    background: "rgba(34, 197, 94, 0.12)",
                    color: "#22c55e",
                    fontSize: "var(--text-sm)"
                  }}>
                    <span aria-hidden style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#22c55e"
                    }} />
                    {genesisProof.status}
                  </span>
                </dd>
              </div>
            </dl>
          ) : (
            <p style={{ margin: 0, color: "var(--text-faint)" }}>Loading...</p>
          )}
        </article>

        {/* Arrow */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          color: "var(--text-faint)"
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 3v14M10 17l4-4M10 17l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Step 3: Reputation */}
        <article aria-label="Genesis Reputation" style={{
          display: "grid",
          gap: "var(--space-4)",
          padding: "var(--space-6)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-subtle)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--brand-violet)",
              color: "white",
              fontSize: "var(--text-sm)",
              fontWeight: "bold",
              flex: "none"
            }}>3</span>
            <span style={{
              fontSize: "var(--text-xs)",
              letterSpacing: "0.18em",
              color: "var(--text-faint)",
              textTransform: "uppercase"
            }}>
              Reputation Engine
            </span>
          </div>
          {genesisReputation ? (
            <dl style={{ margin: 0, display: "grid", gap: "var(--space-3)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div style={{ display: "grid", gap: "var(--space-1)" }}>
                  <dt style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-faint)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase"
                  }}>Score</dt>
                  <dd style={{
                    margin: 0,
                    fontSize: "var(--text-3xl)",
                    fontFamily: "var(--font-display)",
                    color: "var(--text)",
                    fontWeight: "bold"
                  }}>
                    {genesisReputation.score}
                  </dd>
                </div>
                <div style={{ display: "grid", gap: "var(--space-1)" }}>
                  <dt style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-faint)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase"
                  }}>Level</dt>
                  <dd style={{ margin: 0, fontSize: "var(--text-2xl)", color: "var(--text)" }}>
                    {genesisReputation.level}
                  </dd>
                </div>
              </div>
              <div style={{ display: "grid", gap: "var(--space-1)" }}>
                <dt style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase"
                }}>Reason</dt>
                <dd style={{ margin: 0, fontSize: "var(--text-md)", color: "var(--text-muted)" }}>
                  {genesisReputation.reason}
                </dd>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div style={{ display: "grid", gap: "var(--space-1)" }}>
                  <dt style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-faint)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase"
                  }}>Type Weight</dt>
                  <dd style={{ margin: 0, fontSize: "var(--text-md)", color: "var(--text)" }}>
                    {genesisReputation.contribution_type} = 10
                  </dd>
                </div>
                <div style={{ display: "grid", gap: "var(--space-1)" }}>
                  <dt style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-faint)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase"
                  }}>Proof Quality</dt>
                  <dd style={{ margin: 0, fontSize: "var(--text-md)", color: "var(--text)" }}>
                    {genesisReputation.verification} = 1.0
                  </dd>
                </div>
              </div>
              <div style={{
                padding: "var(--space-3) var(--space-4)",
                background: "var(--bg)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--line)",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                fontSize: "var(--text-sm)",
                color: "var(--text-muted)"
              }}>
                Score = 10 × 1.0 × 1.0 = <strong style={{ color: "var(--text)" }}>10</strong>
              </div>
            </dl>
          ) : (
            <p style={{ margin: 0, color: "var(--text-faint)" }}>Loading...</p>
          )}
        </article>
      </section>

      {/* Links to other modules */}
      <section aria-label="Related systems" style={{
        display: "grid",
        gap: "var(--space-4)",
        maxWidth: 760,
        marginBottom: "var(--space-8)"
      }}>
        <h2 style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-2xl)",
          color: "var(--text)"
        }}>
          The Three Systems
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--space-4)"
        }}>
          {[
            { label: "Contribution Registry", href: "/library", desc: "Records and manages contributions" },
            { label: "Proof Engine", href: "/library", desc: "Verifies contribution authenticity" },
            { label: "Reputation Engine", href: "/library", desc: "Calculates contributor standing" }
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "grid",
                gap: "var(--space-2)",
                padding: "var(--space-4)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-subtle)",
                textDecoration: "none"
              }}
            >
              <span style={{ fontSize: "var(--text-md)", color: "var(--text)", fontWeight: 500 }}>
                {link.label}
              </span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-faint)" }}>
                {link.desc}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Canon note */}
      <section aria-label="Important notice" style={{
        display: "grid",
        gap: "var(--space-3)",
        maxWidth: 760,
        padding: "var(--space-6)",
        border: "1px solid var(--attention)",
        borderLeft: "3px solid var(--attention)",
        borderRadius: "var(--radius-md)",
        background: "var(--attention-soft)",
        marginBottom: "var(--space-8)"
      }}>
        <h2 style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xl)",
          color: "var(--text)"
        }}>
          What the Genesis State Is Not
        </h2>
        <ul style={{
          margin: 0,
          paddingInlineStart: "var(--space-6)",
          display: "grid",
          gap: "var(--space-2)",
          color: "var(--text-muted)",
          fontSize: "var(--text-md)",
          lineHeight: "var(--leading-normal)"
        }}>
          <li>Not a token distribution record</li>
          <li>Not a financial instrument</li>
          <li>Not a governance document</li>
          <li>Not a treasury record</li>
          <li>Not a claim of production operation</li>
        </ul>
        <p style={{
          margin: 0,
          fontSize: "var(--text-sm)",
          color: "var(--text-faint)",
          lineHeight: "var(--leading-normal)"
        }}>
          The genesis state is a timestamped, verifiable declaration that the
          MOOD Protocol's core systems existed with a defined initial state.
          See{" "}
          <Link href="/world" style={{ color: "inherit", textDecoration: "underline" }}>
            MOOD_CANON.md
          </Link>{" "}
          for the canonical definition of what MOOD is.
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: "var(--space-12)",
        paddingTop: "var(--space-8)",
        borderTop: "1px solid var(--line)",
        color: "var(--text-faint)",
        fontSize: "var(--text-sm)",
        maxWidth: 760
      }}>
        <p style={{ margin: 0, lineHeight: "var(--leading-normal)" }}>
          Genesis records:{" "}
          <code style={{ fontFamily: "ui-monospace, monospace" }}>
            genesis/genesis.json
          </code>
          {" · "}
          <code style={{ fontFamily: "ui-monospace, monospace" }}>
            genesis/contributions.json
          </code>
          {" · "}
          <code style={{ fontFamily: "ui-monospace, monospace" }}>
            genesis/genesis-proofs.json
          </code>
        </p>
      </footer>
    </main>
  );
}
