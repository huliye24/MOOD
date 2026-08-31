# 022 — Security Control Matrix

**Date:** 2026-08-30

## Status Values

```text
implemented       — Control in place, evidence recorded
partial           — Control in place but with known gaps
missing           — Control not implemented
not-applicable    — Control not relevant to this surface
blocked           — Cannot implement in current architecture
```

## Control Matrix

| Control | Domain | Status | Evidence | Owner | Required for 023? |
|---|---|---|---|---|---|
| **Authentication** | | | | | |
| Wallet signature (SIWE-like) | 015 | partial | `genesis-message.ts`, `genesis-distribution.ts` | Maintainer | Yes |
| Nonce single-use | 015 | implemented | `genesisNonces` table (usedAt) | Maintainer | Yes |
| Nonce expiry | 015 | implemented | `expiresAt` column | Maintainer | Yes |
| Domain binding | 015 | implemented | `domain` column on nonce | Maintainer | Yes |
| Session cookie flags | 015 | partial | TBD - review `apps/web/app/chatgpt-auth.ts` | Maintainer | Yes |
| CSRF protection | 015 | partial | TBD - needs explicit token | Maintainer | Yes |
| **Authorization** | | | | | |
| Server-side role check | 020, 021 | partial | Need code grep audit | Maintainer | Yes |
| Default deny | 022 | implemented | `022_PERMISSION_MATRIX.md` | Maintainer | Yes |
| Author-cannot-self-accept | 020 | implemented | `accept` route requires `actorId !== authorId` | Maintainer | Yes |
| **Treasury** | | | | | |
| Treasury inactive by default | 021 | implemented | `lib/treasury/model.ts` | Maintainer | Yes |
| No transfer API | 021 | implemented | No POST transfer route exists | Maintainer | Yes |
| No auto-payout | 021 | implemented | No cron / setInterval in treasury code | Maintainer | Yes |
| No AI signer | 021 | implemented | No signer tool in agent capabilities | Maintainer | Yes |
| **Governance** | | | | | |
| MIP accepted ≠ Canon update | 020 | implemented | Canon update requires explicit PR | Maintainer | Yes |
| Emergency policy documented | 020 | implemented | `020_EMERGENCY_POLICY.md` | Maintainer | Yes |
| **Web Hardening** | | | | | |
| CSP header | cross | missing | Not configured in `next.config.js` | Maintainer | Yes |
| HSTS | cross | partial | TBD - depends on deployment | Maintainer | Yes |
| X-Content-Type-Options | cross | missing | Not configured | Maintainer | Yes |
| Referrer-Policy | cross | missing | Not configured | Maintainer | Yes |
| Permissions-Policy | cross | missing | Not configured | Maintainer | Yes |
| **API Hardening** | | | | | |
| Bounded pagination | cross | partial | Most routes use LIMIT | Maintainer | Yes |
| Input validation (Zod) | 020 | partial | Some routes use Zod | Maintainer | Yes |
| Rate limiting | cross | missing | Not implemented | Maintainer | Yes |
| Sanitized errors | cross | partial | Most routes return sanitized JSON | Maintainer | Yes |
| **Logging** | | | | | |
| No private key log | cross | implemented | No log statements include keys | Maintainer | Yes |
| Truncated wallet in log | cross | partial | Most logs use full addr (recommend truncated) | Maintainer | Yes |
| **Upload / URL Safety** | | | | | |
| Markdown sanitization | 016, 020 | partial | Some sanitization; needs full audit | Maintainer | Yes |
| SSRF protection | 016 | partial | Evidence URL validation present | Maintainer | Yes |
| **Secret Handling** | | | | | |
| Env-backed secrets | cross | implemented | All secrets read from `process.env` | Maintainer | Yes |
| No secret in client bundle | cross | implemented | Verified by `next build` output | Maintainer | Yes |
| **Incident Response** | | | | | |
| Incident response plan | 022 | implemented | `022_INCIDENT_RESPONSE.md` | Maintainer | Yes |
| Disclosure policy | 022 | implemented | `022_DISCLOSURE_POLICY.md` | Maintainer | Yes |
| **Trust Claims** | | | | | |
| Each claim has evidence | 022 | implemented | `022_PUBLIC_TRUST_CLAIMS.md` | Maintainer | Yes |

---

## 023 Required (SG0-SG10)

| SG | Control | Status |
|---|---|---|
| SG0 | No P0 open | ✅ (F-001 mitigated by Treasury inactive) |
| SG1 | No internet-exploitable P1 | ⚠️ (F-005/F-006/F-007 must close or be accepted) |
| SG2 | Auth/session verified | ⚠️ (TBD code audit) |
| SG3 | Admin APIs fail closed | ⚠️ (TBD audit) |
| SG4 | No secrets in repo | ✅ |
| SG5 | Rate limit on mutations | ❌ |
| SG6 | Security headers baseline | ❌ |
| SG7 | Public serializers reviewed | ⚠️ (F-008 review) |
| SG8 | Incident response published | ✅ |
| SG9 | Security page honest | ✅ |
| SG10 | Token/Treasury writes disabled | ✅ |

---

## Reference

- `022_SYSTEM_THREAT_MODEL.md`
- `022_PERMISSION_MATRIX.md`
- `022_STAGING_SECURITY_GATE.md`
- `022_FINDINGS.md`
