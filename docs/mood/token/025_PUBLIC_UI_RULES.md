# 025 — Public UI Rules (TEMPLATE)

**Status:** `025_TOKEN_ACTIVATION_BLOCKED_BY_024`
**Last updated:** 2026-08-30

---

## Purpose

Codify what the public token page may and may not show, **before and after** Official CA publication. The intent is to never let UI become a manipulative launch surface.

---

## Pre-Activation (`token-ready`)

The token page MUST show:

- A clear banner: "Token is not yet live. No Official Contract Address has been published."
- 024 public disclosure (risk warnings).
- Legacy token notice (per 024 legacy policy).
- A link to `024_PUBLIC_DISCLOSURE.md` and `024_LEGACY_TOKEN_POLICY.md`.

The token page MUST NOT show:

- Buy / Sell / Swap CTA.
- Claim CTA.
- Any candidate CA (even one marked "pending").
- Price, market cap, 24h volume.
- Holder count.
- "APY" / "yield" / "reward rate".
- PancakeSwap pair link, Flap pair link, or any trading venue URL.

---

## Post-Activation (`token-active`)

Allowed surfaces:

- Official MOOD Contract (with explorer link).
- Chain = BNB Smart Chain (chain ID 56).
- Token name / symbol / decimals / total supply.
- Tokenomics summary (taxes 0 / disabled; rewards 0 / disabled; auto-LP 0 / disabled).
- Admin rights summary (owner model as frozen).
- Treasury status (per 024 frozen policy).
- Liquidity policy and current LP status (if any).
- Legacy notice (per 024 frozen policy).
- Risk disclosure (per 024 frozen policy).
- Verification links (source, deployment tx).

Forbidden:

- "Guaranteed return", "fixed yield", "稳赚", "保本", "高收益".
- Fake holder count, fake volume, fake market cap.
- Misleading "locked LP" claims without on-chain evidence.
- Coordinated pump language ("to the moon", "100x").
- APY / APR numbers tied to token balance.
- Auto-buy affiliate links that masquerade as official CTAs.

---

## Trading CTA

Allowed only when:

- Official CA is in Canon.
- Venue is real (Flap or DEX with real liquidity).
- Route is verified end-to-end.
- Risk disclosure is one click away.

If any of the above is missing, the CTA **must not render**. A non-rendering CTA is the safe default.

---

## Token Page as Governance Surface

The token page is **not** a governance surface. It does not show:

- Vote weight by balance.
- Staking-to-vote prompts.
- Quorum status.
- Delegation status.

Token-weighted governance requires a future MIP. Until then, `020_GOVERNANCE` remains authoritative.

---

## Identity ≠ Token

The token page must **not** imply:

- Resident = Holder.
- Reputation = Balance.
- Governance = Token weight.

These are independent surfaces per Canon.

---

## Wallet / Passport Integration (cross-ref `025_WALLET_PASSPORT_BOUNDARY.md`)

Wallet may show real `MOOD balance` post-activation. Passport identity, contribution reputation, and governance standing remain separate.
