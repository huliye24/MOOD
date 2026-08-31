# 023 — Health Model

**Date:** 2026-08-30

## Public Health Endpoints

### `GET /api/health`

Public-safe health check.

Response (200):

```json
{
  "status": "ok",
  "environment": "staging",
  "version": "<commit-sha>",
  "timestamp": "<iso>",
  "components": {
    "web": "ok",
    "database": "ok",
    "rpc": "ok"
  }
}
```

Response (503):

```json
{
  "status": "degraded",
  "environment": "staging",
  "version": "<commit-sha>",
  "timestamp": "<iso>",
  "components": {
    "web": "ok",
    "database": "unavailable",
    "rpc": "ok"
  }
}
```

### `GET /api/network/health`

Existing 017 health endpoint. Sanitized.

### `GET /api/security/status`

022 security status payload (sanitized).

## Forbidden in Health Responses

- DB host
- Private service URL
- Stack trace
- Secrets / env values
- Internal topology

## Lightweight Monitoring

023 does NOT require full observability platform. Minimum:

- Uptime (HTTP 200 vs other)
- Error rate (4xx / 5xx ratio)
- Auth failure spike (signature failures / IP)
- DB health (response time)
- Contribution API health
- Agent / Node heartbeat freshness

If staging is down for >5 minutes, alert.

## What 023 Does NOT Include

- Full tracing (OpenTelemetry etc.)
- Log aggregation platform
- SIEM
- On-call rotation

These are deferred to post-launch.

---

## Reference

- `apps/web/app/api/health/route.ts` (if exists, otherwise create)
- `apps/web/app/api/network/health/route.ts`
- `apps/web/app/api/security/status/route.ts`