# MOOD CLI — First Run Demo Script

A ~90-second screen recording for the website, Twitter/X, and YouTube.
One terminal, six commands, one story: *a stranger types `mood` and enters
a new network.*

> Presenter's rule: never paste, never edit. Every keystroke is real.

---

## Preparation (before recording)

| Item | Setting |
|------|---------|
| Terminal | Any true terminal (Windows Terminal / iTerm2 / GNOME Terminal) — **not** an IDE console, so colors render |
| Font | A monospace font with full box-drawing glyphs (Cascadia Code, JetBrains Mono, Menlo) |
| Shell | Fresh window, empty prompt, cwd = home directory |
| Node state | **Clean machine** — `~/.mood` must not exist (see Reset below) |
| Optional | `npm run dev:relay` in a second terminal, if you want live peers in Scene 5 |

Reset to a clean machine before the take:

```bash
mood stop || true          # stop any running node
rm -rf ~/.mood             # wipe identity + data (fresh genesis moment)
```

Install check (one line, already done on the demo machine):

```bash
npm install && npm install -g apps/mood-cli   # from the repo root
```

---

## Scene flow

### Scene 1 — The logo (0:00–0:10)

```bash
mood
```

Expected:

```text
        ███╗   ███╗ ██████╗  ██████╗ ██████╗
        ████╗ ████║██╔═══██╗██╔═══██╗██╔══██╗
        ██╔████╔██║██║   ██║██║   ██║██║  ██╗
        ██║╚██╔╝██║██║   ██║██║   ██║██║  ██║
        ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝██████╔╝
        ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝

        ~ MOOD ~

        Contribution Network

        Protocol:  v0.1
        Network:   MOOD Alpha Testnet
        Node:      (not initialized — run `mood init`)
        Status:    Stopped

        "Contribution creates consensus."

        Try: `mood init`, `mood start`, `mood status --json`
```

**Narration beat:** "This is MOOD. Not an app — a protocol node. And right
now, this machine is nobody."

---

### Scene 2 — Identity creation (0:10–0:25)

```bash
mood init
```

Expected:

```text
MOOD identity created.

  Node ID:       mood:node:7554ccdf2cec12acbb3099ce48687437f12fab7e19a3ae1f0e1dc6f1362fa22e
  Network:       MOOD Alpha Testnet
  Home:          C:\Users\Administrator\.mood
  ...
```

**Narration beat:** "One command, and this machine now has a cryptographic
identity on the alpha testnet. The private key was generated locally —
and never printed, never sent, never leaves this machine."

*(Camera note: the Node ID here is your demo machine's ID — it will differ
from the example above. That is the point: every machine gets its own.)*

---

### Scene 3 — The node runs (0:25–0:40)

```bash
mood start
```

Expected:

```text
  Starting MOOD Node...

  Protocol:    v0.1
  Network:     MOOD Alpha Testnet
  Status:      Running
  PID:         15276
  Log:         C:\Users\Administrator\.mood\logs\node.log
```

**Narration beat:** "The node runs in the background. No Docker, no config
files, no wallet setup. It is already computing its first epoch snapshot —
the SHA-256 digest that every node on the network must agree on."

---

### Scene 4 — Status (0:40–0:55)

```bash
mood status
```

Expected:

```text
MOOD Node Status

  Node ID:      mood:node:7554ccdf2cec12acbb3099ce48687437f12fab7e19a3ae1f0e1dc6f1362fa22e
  Network:      MOOD Alpha Testnet
  Protocol:     v0.1
  Status:       Running
  Peers:        0 connected
  Latest Epoch: 001
  Snapshot:     sha256:95621e6c18c6208e17da10ccc701def488cfaec1ee52a535acf789e5b5428fc1
  Agreement:    Verified
```

**Narration beat:** "Epoch 001. A digest. Agreement verified — this machine
just participated in consensus for the first time."

---

### Scene 5 — The machine interface (0:55–1:15)

```bash
mood status --json
```

Expected (one line):

```json
{"ok":true,"nodeId":"mood:node:...","network":"MOOD Alpha Testnet","networkId":"mood-testnet-001","protocol":"0.1","status":"Running","peers":0,"epoch":1,"digest":"...","agreement":"Verified","startedAt":"...","pid":15276}
```

**Narration beat:** "And here is why this node is AI-native. Every command
speaks JSON. A human reads the screen; an agent reads the envelope. Same
node, same data, two audiences. If you can run a shell and parse JSON, you
can operate a MOOD node."

*(Optional beat, if the relay is running: `mood peers` — show live
connections.)*

---

### Scene 6 — Closing (1:15–1:30)

Run `mood` once more — the same screen as Scene 1, but now:

```text
        Node:      mood:node:7554ccdf2cec12acbb3099ce48687437f12fab7e19a3ae1f0e1dc6f1362fa22e
        Status:    Running
```

**Closing line:** "Ten minutes ago this machine was nobody. Now it has an
identity, an epoch, and a verified digest on a shared network. No token.
No wallet. No mining. Just contribution — and consensus."

---

## Production notes

- **Colors:** the logo and highlights are colorized only in a real TTY.
  Piping output to a file (or `NO_COLOR=1`) yields the plain path — both are
  correct behavior, but record in a real terminal for the visual.
- **Never show:** `cat ~/.mood/identity/private.json`. The demo's whole
  security story is that this file exists but never appears on screen.
- **Windows note:** the Home/Log paths render with backslashes on Windows
  and forward slashes elsewhere — both are normal.
- **Timing:** total runtime ≈ 90 s at a relaxed typing pace. Record scenes
  separately if needed; the flow is idempotent except `mood init`.
- **Retake-safe:** after a full take, reset with Scene "Preparation" and go
  again. `mood init` generates a brand-new Node ID each reset — visible
  proof that identity is real and per-machine.

## What this demo deliberately does NOT show

No token, no wallet, no balance, no mining, no staking, no rewards, no
governance. Phase Zero. The demo shows the network itself — identity,
epochs, digests, agreement — because that is all MOOD is right now, and
that restraint *is* the message.
