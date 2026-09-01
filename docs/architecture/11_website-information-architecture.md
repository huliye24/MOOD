<!-- pack: MOOD_Network_Architecture_Pack_001 | status: v0.1 conceptual | subordinate to MOOD_CANON.md -->

# MOOD Website Information Architecture

> **Note:** Per `MOOD_CANON.md` §7, the website is an entrance, not
> the world. The website must not invent concepts. The Canon feeds the
> website; the website does not silently rewrite the Canon.

Website is the public entrance of MOOD.

Structure:

```
MOOD Website

/
├── World
│   Manifesto
│   Vision
│
├── Protocol
│   Architecture
│   Contribution
│   Governance
│
├── Network
│   Builders
│   Agents
│   Nodes
│   Projects
│
├── Blockchain
│   Token         [planned]
│   BSC           [planned]
│   Treasury      [planned]
│
└── Portal
    Wallet                [planned]
    Contribution          [planned]
    Dashboard             [planned]
```

> All Portal items are planned. None are live. No claim is made that
> wallet, contribution, or dashboard features are deployed.

---

# Connection Between Surfaces

| Surface | Role |
|---|---|
| GitHub | Build layer — code, documentation, collaboration |
| Website | Entry layer — world, protocol, network, portal |
| Blockchain (BSC) | Settlement layer — token, transparency, economic coordination |

Per Canon §7, the website renders Markdown from this repository. It
should not invent canonical content; it surfaces what is documented
here.

---

# Document Sourcing

| Website section | Source documents in this repository |
|---|---|
| World / Manifesto | `MOOD_CANON.md`, `docs/manifesto/` |
| World / Vision | `docs/manifesto/ai-native-society.md`, `digital-silicon-valley.md` |
| Protocol / Architecture | `docs/architecture/02_protocol-architecture.md` |
| Protocol / Contribution | `docs/architecture/04_contribution-policy.md`, `05_contribution-proof.md` |
| Protocol / Governance | `docs/architecture/08_governance-model.md`, `09_governance-process.md` |
| Network / Builders | `docs/network/builders.md` |
| Network / Agents | (planned — no source document yet) |
| Network / Nodes | (planned — no source document yet) |
| Network / Projects | (planned — no source document yet) |
| Blockchain / Token, BSC, Treasury | `docs/blockchain/bsc-integration.md` (all `[UNVERIFIED]`) |
| Portal | (planned — not implemented) |

Where a website section has no source document, the section must
remain empty or marked planned. The website must not invent content
to fill pages.
