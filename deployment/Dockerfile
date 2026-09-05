# MOOD Node image — Node Deployment Alpha 001, Phase 2.
#
# ONE image, two compose services (see docker-compose.yml at the repo root):
#   mood-node   → default ENTRYPOINT (docker-entrypoint.mjs, PID-1 supervisor)
#   mood-relay  → command: ["node", "services/relay/src/relay.js"]
#
# Rules this image follows (deployment/ARCHITECTURE.md):
#   - infrastructure only; no protocol logic is added or changed
#   - dependencies pinned by the ROOT package-lock.json via a
#     workspace-filtered `npm ci` (installs only the node/relay subgraph —
#     no web/desktop/electron dependencies; verified in Phase 0/2 audit)
#   - every process runs as the non-root `mooduser`
#   - writable state is confined to /data (the MOOD_HOME volume)
#
# Build context is the repository root:
#   docker build -f deployment/Dockerfile -t mood-node:alpha-001 .

# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim

# One non-root user owns the node state and runs every process in the
# container (daemon, API, relay). Fixed UID/GID so volume permissions are
# stable across hosts.
RUN groupadd --gid 10001 mood \
  && useradd --uid 10001 --gid mood --shell /usr/sbin/nologin --create-home mooduser

WORKDIR /app

# ── Dependency layer ────────────────────────────────────────────────────────
# Only the manifests the filtered install needs. The root lockfile pins
# every workspace's dependency graph; `-w` selects the node subgraph.
# apps/web and apps/mood-desktop are intentionally absent — they are not
# workspaces of this image (the lockfile tolerates their absence).
COPY package.json package-lock.json ./
COPY apps/mood-cli/package.json apps/mood-cli/
COPY services/node-api/package.json services/node-api/
COPY services/relay/package.json services/relay/
COPY packages/mood-connector/package.json packages/mood-connector/
COPY packages/contribution-proof/package.json packages/contribution-proof/
COPY packages/identity/package.json packages/identity/
COPY packages/node-runtime/package.json packages/node-runtime/
COPY packages/protocol-object/package.json packages/protocol-object/
COPY protocol/contribution/package.json protocol/contribution/

RUN npm ci --omit=dev -w apps/mood-cli -w services/node-api -w services/relay \
  && npm cache clean --force

# ── Source layer ────────────────────────────────────────────────────────────
# Full source of the same workspaces. node_modules/@mood/* are symlinks
# into these directories, so the source must be present for the symlinks
# to resolve.
COPY apps/mood-cli apps/mood-cli
COPY services/node-api services/node-api
COPY services/relay services/relay
COPY packages/mood-connector packages/mood-connector
COPY packages/contribution-proof packages/contribution-proof
COPY packages/identity packages/identity
COPY packages/node-runtime packages/node-runtime
COPY packages/protocol-object packages/protocol-object
COPY protocol/contribution protocol/contribution
COPY deployment/docker-entrypoint.mjs /usr/local/bin/docker-entrypoint.mjs

# ── Container runtime defaults ──────────────────────────────────────────────
# MOOD_HOME is the /data volume: identity, config, state, logs, snapshots,
# contributions, reports. Created here so a fresh named volume inherits
# mooduser ownership on first mount.
#
# MOOD_API_BIND=0.0.0.0 binds INSIDE the container only — host exposure is
# governed by the compose `ports:` mapping, which publishes on loopback by
# default. This does not weaken the API's security model: the Host-header
# allowlist still applies, and reaching the API from outside is a
# deliberate operator action.
ENV MOOD_HOME=/data \
    NODE_ENV=production \
    MOOD_API_BIND=0.0.0.0 \
    MOOD_API_ALLOWED_HOSTS=mood-node

RUN mkdir /data && chown mooduser:mood /data

USER mooduser

# 8788 = node API (mood-node service) · 8080 = relay (mood-relay service)
EXPOSE 8788 8080

# Liveness of the NODE service: /health answers before auth. The relay
# service overrides this in docker-compose.yml (it speaks WebSocket, not
# HTTP). slim images ship no curl/wget — use Node's global fetch.
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.MOOD_API_PORT||'8788')+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["node", "/usr/local/bin/docker-entrypoint.mjs"]
