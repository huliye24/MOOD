# MOOD Desktop — Experimental GUI

> **Status: Experimental.** The CLI is the primary MOOD interface.
> See [`apps/mood-cli`](../mood-cli) and [docs/node/CLI.md](../../docs/node/CLI.md).

The desktop client is a one-click Electron shell around the exact same
runtime the CLI uses ([`@mood/node-runtime`](../../packages/node-runtime)):
identity, invitations, relay sync, and snapshot agreement all come from the
shared runtime — the GUI implements none of its own protocol logic.

It exists for users who prefer a window over a terminal. It is not required
to run a MOOD node:

```bash
# The primary interface — run a node from any terminal
mood init
mood start
mood status --json

# The experimental GUI (this app)
npm run dev:node        # from the repository root
```

## Development

```bash
cd apps/mood-desktop
npm install             # from the repository root: npm install links workspaces
npm run dev             # launch Electron
npm run build           # package installers via electron-builder
```

## Layout

```
desktop/    Electron main process (runtime wiring only)
preload/    Context bridge between main and renderer
renderer/   Window UI
assets/     Icons
```

MOOD is not an application. MOOD is a protocol node — the GUI is one of
several ways to operate it, not the product itself.
