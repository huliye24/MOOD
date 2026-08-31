# 024 — Public Disclosure

**Date:** 2026-08-30

## Mandatory Public Disclosures

024 requires the following disclosures to appear in `024_PUBLIC_DISCLOSURE.md` AND be visible to the public via `/token`, `/transparency`, `/security`, and the staging banner:

### Token Is Experimental

```text
MOOD is an experimental protocol token. It has not been registered or approved
by any securities regulator. There is no guarantee of value, listing, or
continued development.
```

### No Guaranteed Returns

```text
There is no promised yield, no fixed return, no guaranteed reward.
Any "rewards" are rules-driven and depend on actual protocol activity.
```

### No Fixed Yield

```text
MOOD does not offer fixed yield, fixed APY, or stable dividend.
```

### Market Price Volatility

```text
Token market price may be highly volatile and may decline to zero.
Trading liquidity may be limited or unavailable.
```

### Liquidity Risk

```text
Liquidity provision is launch-dependent. There is no guarantee that
PancakeSwap, Flap, or any other venue will list or maintain liquidity.
```

### Smart Contract Risk

```text
Smart contracts may contain bugs, including loss-of-funds bugs.
Source code will be publicly verified, but verification does not eliminate risk.
```

### Platform Risk

```text
Launch platform (Flap) and DEXes (PancakeSwap) introduce third-party risk
independent of MOOD protocol.
```

### Governance Is Evolving

```text
MOOD Governance is v1: process-transparent but not yet fully decentralized.
Maintainer authority persists until an accepted MIP migrates to multi-maintainer.
```

### Treasury Controls / Admin Permissions

```text
Maintainer-class operations (mint if enabled, blacklist if enabled, pause)
exist as documented in 022_FINDINGS.md. These may be centralized in v1.
```

### Legacy Token Policy

```text
Per 024_LEGACY_TOKEN_POLICY.md: no legacy migration planned.
The current placeholder address is NOT YET OFFICIAL.
```

### Official CA Verification Rule

```text
The Official Contract Address is published only after:
- Source verified on bscscan
- Independent second check
- Maintainer approval recorded
- Canon updated
Per 024_CA_PUBLICATION_PROTOCOL.md.
Any other address claiming to be MOOD is not official.
```

## Disclosure Locations

```text
- /token page: disclaimer banner + risks section
- /transparency: risks section
- /security: TC-001..TC-010 trust claims
- Footer: "Token is experimental. Not investment advice."
```

## What 024 Forbids in Public Copy

```text
- "100% secure"
- "Fully decentralized"
- "Audited by industry leaders"
- "Zero risk"
- "Investment opportunity"
- "Limited time offer"
- "Presale bonus"
- "Whitelist access"
- "Token is live" (until 025)
- "Now trading" (until 025)
- "Buy MOOD" / "Trade MOOD" / "Claim MOOD" CTAs
- Any price / volume / market cap claim without verified oracle source
```

## Reference

- `024_CA_PUBLICATION_PROTOCOL.md`
- `024_LEGACY_TOKEN_POLICY.md`
- `docs/mood/security/022_PUBLIC_TRUST_CLAIMS.md`