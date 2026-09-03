# MOOD AI Workflow Demo — First AI-Ready Startup Experience

A short demo of the MOOD minimal core experience: **a human turns MOOD on,
then an AI agent starts working on top of a connected contribution network.**

One terminal, five commands, one story: *start MOOD, and the machine is ready
for AI work on the network.*

> Record in a true terminal (Windows Terminal / iTerm2 / GNOME Terminal) —
> **not** an IDE console — so colors render (TTY-only).

---

## The Story

```text
Human
  |
启动 MOOD / turn on MOOD
  |
MOOD Node Online
  |
AI Agent Working
  |
Contribution Layer Ready
```

MOOD is **not** an AI assistant and does **not** replace Claude Code, Codex,
or Cursor. Those engines create; the connector turns an installed agent
environment into a contributor on the MOOD network. This demo makes that
boundary visible.

---

## Script (5 commands, ~60-90 seconds)

### 1. Start MOOD

```text
mood
```

Expected on screen:

```text
        ███╗   ███╗ ██████╗  ██████╗ ██████╗
        ████╗ ████║██╔═══██╗██╔═══██╗██╔══██╗
        ██╔████╔██║██║   ██║██║   ██║██║  ██║
        ██║╚██╔╝██║██║   ██║██║   ██║██║  ██║
        ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝██████╔╝
        ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝

        ~ MOOD ~
        Contribution Network
        Protocol: v0.1 · Network: MOOD Alpha Testnet
        "Contribution creates consensus."
```

Narration beat: *a terminal opens, and a network identity greets you.*

### 2. Start the node

```text
mood start
```

Expected:

```text
Starting MOOD Node...
Status: Running
```

### 3. Detect the AI environment

```text
mood connector detect
```

Expected (this machine, at acceptance time):

```text
AI Agent Detection
  Claude Code    installed (command, config)
  Codex          installed (config)
  Cursor         installed (command, install-path)
  Ready for connection.
```

Narration beat: *detection only — nothing is launched, no credentials are
read.*

### 4. Verify readiness

```text
mood connector status
```

Expected:

```text
MOOD Connector
  Connector:  active
  Agents:     Claude Code, Codex, Cursor
  Network:    Ready
```

### 5. Start AI work

```text
claude        # or: codex
```

Narration beat: *the AI opens on top of the running MOOD identity. AI engines
create; MOOD records contribution; the network verifies.*

---

## One-time setup (before recording)

Run once so the recording stays clean:

```text
mood init                 # node identity (~/.mood/identity)
mood connector init       # connector identity (~/.mood/connector)
mood connector register   # register detected agents as contributors
```

During the recording itself, only run the five commands above — never paste,
never edit, every keystroke is real.

## Production notes

- Colors are TTY-only (`useColor = isTTY && !NO_COLOR`). The non-TTY path
  renders plain; record in a real terminal.
- Startup of the home screen is sub-second; `mood api start` waits for the
  health probe before announcing "Ready for AI Agents".
- `mood status` shows Epoch 001 / Agreement: Verified after the first start.

## Safety red lines (never record these)

- Never run `mood identity show` expecting a private key — it does not and
  must not print one ("Private key never leaves this machine.").
- Do not type or reveal any API keys, Claude/Codex/OpenAI credentials, or
  the contents of `~/.mood/identity/private.json`.
- Do not claim a relay, peers, or a second real node exists if it does not —
  "Peers: 0" is honest and fine on camera.
