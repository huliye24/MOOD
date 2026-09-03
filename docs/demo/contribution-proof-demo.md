# MOOD Contribution Proof Demo — Proving Work Happened

The core MOOD differentiator in ~60 seconds: **MOOD proves that a
contribution event existed and was not modified.** Not tokens, not rewards —
proof that work happened.

```text
Human / AI Agent
        |
Contribution Event
        |
Hash
        |
Proof Object
        |
MOOD Node Storage
        |
Verify
```

---

## Script (4 commands)

### 1. Turn on MOOD

```text
mood
```

The identity screen appears (~ MOOD ~ / Contribution Network).

### 2. Record a contribution

```text
mood contribution create --actor claude-code --type code_change \
    --description "Fixed the relay retry backoff"
```

Expected:

```text
MOOD Contribution created.
  Event:    event:mood:<24-hex>
  Proof:    sha256:<64-hex>
  Verified: true
```

Narration beat: *an AI agent's work just became a verifiable event — hashed,
stored, provable.*

### 3. Prove it (tamper test, the money shot)

Modify the stored event's description, then verify:

```text
# (in the demo, edit the description field of the event file)
mood contribution verify
```

Expected:

```text
1. FAIL   event:mood:<24-hex>
   · event hash mismatch: proof records sha256:…, recomputed sha256:…
Summary: 0/1 verified — 1 FAILED
```

Narration beat: *change one word and the proof breaks — that is the whole
point.*

Restore the file, verify again:

```text
mood contribution verify
```

Expected:

```text
1. PASS   event:mood:<24-hex>
Summary: 1/1 verified
```

### 4. Read it back through the AI door (optional)

```text
mood api start
curl http://127.0.0.1:8788/contributions
```

Expected JSON: `{"contributions":[{"event":{…},"proof":{"verified":true,…}}]}`

---

## Safety red lines (never record these)

- Never show `~/.mood/identity/private.json` or any private key.
- Never type real e-mail addresses as `--actor` on camera (actor references
  are stored verbatim) — use `claude-code`, `codex`, or a fake
  `name@example.test` reference.
- Never claim a second node, a relay, or network consensus exists if it does
  not — this demo proves a local proof, which is already enough.
- The API defaults to keyless local-only mode; do not expose port 8788
  beyond the machine during a recording.

## Production notes

- Run in a true terminal for color (TTY-only). Non-TTY renders plain.
- Use `MOOD_HOME` pointing at a scratch directory if you do not want the demo
  contributions in your real `~/.mood` (e.g. PowerShell:
  `$env:MOOD_HOME = "$env:TEMP\mood-demo"`).
- `mood contribution create` works without a running node (local file
  storage); the node is only needed for the network layer.
