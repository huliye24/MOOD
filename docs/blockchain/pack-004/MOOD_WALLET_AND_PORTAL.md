<!-- pack: MOOD_Blockchain_Integration_Architecture_Pack_004 | status: v0.1 conceptual | subordinate to MOOD_CANON.md -->

# MOOD Wallet and Portal Architecture

Website Portal connects users with the network.

Potential features:

- wallet connection
- contributor identity
- token information
- ecosystem participation
- governance interface

Portal is the bridge between users and protocol.

---

> **No wallet provider, wallet-connect integration, custody partner,
> signing flow, or on-chain transaction is asserted as live in this
> Pack.** The portal is described as a future bridge, not an active
> gateway.
>
> Per `MOOD_CANON.md` §Safety, any wallet interaction that can sign,
> transfer value, or commit a user requires:
> 1. Authoritative specification with verifiable evidence.
> 2. Canon alignment review (especially §9, §11, §12, §Safety).
> 3. Explicit human approval per release.
>
> Until those conditions are met, wallet connection, governance
> interfaces, and token displays remain planned UI surfaces, not
> live features.

## Direction vs Implementation

| Surface | Direction | Implementation status |
|---|---|---|
| Wallet connection | planned | not deployed |
| Contributor identity | planned | not deployed |
| Token information display | planned | not deployed |
| Ecosystem participation UI | planned | not deployed |
| Governance interface | planned | not deployed |

Each surface requires Canon alignment and human approval before
shipping to any user-facing environment.

## Independence

Per `MOOD_CANON.md` §11, this portal is a MOOD surface, not a
Moodify Music surface. No music-processing code, private audio,
moodify-* identifiers, or unrelated Moodify product assets are
adopted into the MOOD portal architecture.