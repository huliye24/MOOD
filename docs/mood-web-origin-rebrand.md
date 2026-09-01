# MOOD Web Origin Rebrand Plan

> **Status:** draft, not yet ratified
> **Scope:** server-side identity only — directories, domain, cloudflared, nginx.
> **Out of scope:** GitHub repo name, package names inside the repo, route design, IA changes.
> **Authority:** `AGENTS.md` (product identity), `MOOD_CANON.md` (world).
> **Predecessor task:** MOOD WEB ORIGIN 001 — staging-only deployment on `mood.crestwavecoin.com`.

## 1. Why this plan exists

The repository `huliye24/MOOD` and the runtime at `crestwavecoin.com` are currently
in a transition state. Three different name spaces are still entangled:

| Namespace                       | Current value                        | Desired value                |
|---------------------------------|--------------------------------------|------------------------------|
| Public product                  | MOOD                                 | MOOD                         |
| Server release directory        | `/opt/crestwave/releases/...`        | `/opt/mood/releases/...`     |
| Server runtime user             | `moodify`                            | `mood`                       |
| Apex public domain              | `crestwavecoin.com`                  | **TBD by MOOD team**         |
| Public staging sub              | (about to become) `mood.crestwavecoin.com` | `mood.<apex>` after apex move |
| Cloudflare tunnel name          | `92f54925-…-1702a14e2a70`            | leave for now                |
| cloudflared ingress hostnames   | `crestwavecoin.com`, `rongjing*`     | MOOD apex only; rongjing* are out of scope of this rebrand and must be migrated elsewhere first |

Per `AGENTS.md`:

> Historical `Moodify`, `moodify-*`, or `MOOD-GENESIS-*` identifiers may remain where
> changing them would break stored data, schemas, contracts, or compatibility. They are
> migration inputs, not the public product identity.

This plan treats the server-side names as **migration inputs**, not as the public identity.
It moves them deliberately, one at a time, with a rollback window for each step.

## 2. Constraints that shape the plan

1. **MOOD must not be the reason a Moodify property goes down.** `rongjingmusic.com`,
   `rongjingwenchuan.com`, `play.rongjingmusic.com`, `rongjinwenchuan.xyz` are still
   served from this same origin via cloudflared and `moodify-sites` vhost. They must be
   moved to a different origin **before** the rebrand touches the apex domain. This plan
   does not design that move — it just records the dependency.
2. **No reverse proxy on `crestwavecoin.com` may be silently repointed.** Every public
   hostname change is a human gate.
3. **No destructive moves.** Renames go through `copy → swap symlink → smoke test →
   keep old path as `*-deprecated` for ≥ 7 days → delete`. No `rm -rf` on a directory
   that a currently-running process is `cwd`'d into.
4. **No domain move during Phase Zero.** The Canon is still being authored. Changing the
   apex domain locks the brand into a contract that the Canon has not yet ratified.
5. **The first MOOD-named surface is the staging subdomain**, not the apex.

## 3. Target end state (post-rebrand)

```text
/opt/mood/                                ← was /opt/crestwave/
  releases/<UTC>-<short-sha>/             ← immutable per deploy
  current -> releases/<active>             ← symlink, atomically swapped
  runtime/                                ← empty for now, reserved for state

system user: mood                         ← was moodify
service user on box: mood (uid TBD)

nginx:
  /etc/nginx/sites-enabled/mood.conf     ← was crestwavecoin.com
    server_name <mood-apex> www.<mood-apex>
    location / → proxy_pass http://127.0.0.1:<mood-port>

cloudflared:
  ingress:
    - hostname: <mood-apex>
      service: http://127.0.0.1:80
    - hostname: www.<mood-apex>
      service: http://127.0.0.1:80
    - hostname: mood.<mood-apex>          ← staging, retained
      service: http://127.0.0.1:80
    # rongjing* entries removed only after their new origin is verified
    - service: http_status:404
```

The only authoritative naming authority for `<mood-apex>` is the MOOD team. This plan does
not pick the apex. It only documents the migration path.

## 4. Phases

### Phase A — Parallel staging origin (already in flight under MOOD WEB ORIGIN 001)

- `/opt/mood/repo/` cloned fresh from `codex/mood-canon-deployment` at `835c8f939`.
- Build artifact landed at `/opt/mood/releases/<UTC>-835c8f9/`.
- A new long-running vinext process bound to `127.0.0.1:3270`.
- A new nginx vhost for `mood.crestwavecoin.com` pointing at `127.0.0.1:3270`.
- DNS record for `mood.crestwavecoin.com` is the **only** DNS change in this phase,
  added by a human in the Cloudflare dashboard, proxied orange-cloud.
- `crestwavecoin.com` and `rongjing*` are not touched.

This phase proves MOOD has an independent build + serve path before anything else moves.

### Phase B — Dual-run under `/opt/mood/`

- Promote the staging build to also serve `crestwavecoin.com` *if and only if* the MOOD
  team has decided the apex stays `crestwavecoin.com` for now.
- Concretely: keep `/opt/crestwave/current` pointing at the current 3200 release, and
  add `/opt/mood/current` pointing at the new release. The nginx vhost switches its
  `proxy_pass` from `127.0.0.1:3200` to `127.0.0.1:3270` only after the new origin has
  served 100% of the canonical routes (`/`, `/token`, `/whitepaper`, `/canon`,
  `/canon/raw`) with the expected HTTP 200s for at least 24 hours.
- Rollback at this phase is a single nginx reload.

### Phase C — rongjing* extraction (BLOCKING for Phase D)

- Identify a different origin for `rongjingmusic.com`, `rongjingwenchuan.com`,
  `play.rongjingmusic.com`, `rongjinwenchuan.xyz`. Options to evaluate: separate VM,
  separate cloudflared tunnel, a sibling container on this host.
- Migrate each one with its own cutover window. Until each is migrated, the cloudflared
  ingress entries must remain — the moodify-sites nginx vhost must remain.
- This phase is **not designed by this plan** because it depends on MOOD/Moodify
  commercial decisions the author cannot see.

### Phase D — Directory rename

Preconditions: Phases A, B, C are complete. The `moodify-sites` vhost is empty or absent.
No process has `cwd` under `/opt/crestwave/`.

Steps, in order, each verified by a smoke test before the next:

1. `sudo systemctl stop mood-web && sudo systemctl disable mood-web` (or `kill <pid>`
   for the vinext process — there is no systemd unit on the current host, so use the
   pidfile the staging launch will create).
2. `sudo cp -a /opt/crestwave/releases/<last-3200-release> /opt/mood/releases/<last-3200-release>`.
3. `sudo -u mood rsync -a /opt/crestwave/runtime/ /opt/mood/runtime/` (placeholder —
   `runtime/` is empty today).
4. `sudo ln -sfn /opt/mood/releases/<last-3200-release> /opt/mood/current`.
5. Update nginx vhost `proxy_pass` to `http://127.0.0.1:<mood-port>`.
6. `sudo nginx -t && sudo nginx -s reload`.
7. Smoke test `/`, `/token`, `/whitepaper`, `/canon`, `/canon/raw` on the apex domain.
8. After 7 days of clean smoke tests, `sudo mv /opt/crestwave /opt/crestwave-deprecated`.
9. After 30 days of clean smoke tests, `sudo rm -rf /opt/crestwave-deprecated`.

### Phase E — User rename

Preconditions: Phase D step 7 complete.

- Create a `mood` system user with the same uid/gid as `moodify` to avoid permission
  churn on files copied in Phase D. If the system user has running processes, stop them
  first; today there are none owned by `moodify` (the vinext process runs as root).
- `sudo usermod -l mood moodify && sudo groupmod -n mood moodify`. `-d` the home.
- Verify no remaining `moodify` user or group entries in `/etc/passwd`, `/etc/shadow`,
  `/etc/group`, `/etc/sudoers.d/`, crontabs.

### Phase F — Apex decision

If the MOOD team decides the apex domain moves away from `crestwavecoin.com`:

- New apex is registered and added to Cloudflare.
- Apex DNS A record is added with proxy on.
- cloudflared ingress gains a new top entry for the new apex pointing at `127.0.0.1:80`.
- `crestwavecoin.com` keeps serving for ≥ 90 days with a permanent 301 to the new apex
  at the nginx layer.
- After 90 days, the cloudflared ingress entry for `crestwavecoin.com` is removed.
- The `crestwavecoin.com` certificate in Cloudflare is left to expire.

This phase is the only one that touches the brand surface publicly. It is the last phase
on purpose.

## 5. Rollback matrix

| Phase | Rollback action                                                                                          | Data loss window |
|-------|----------------------------------------------------------------------------------------------------------|------------------|
| A     | `nginx -s reload` reverting the `mood.crestwavecoin.com` vhost to point at `127.0.0.1:3200`.             | 0                |
| B     | Same as A.                                                                                               | 0                |
| C     | Per-host. Restore cloudflared entry, restore nginx `server_name`, smoke test the affected hostname.       | 0                |
| D     | `mv /opt/mood /opt/mood-bad && mv /opt/crestwave-deprecated /opt/crestwave && nginx -s reload`.           | ≤ 30 days        |
| E     | `usermod -l moodify mood && groupmod -n moodify mood`. Update `/etc/passwd` etc.                          | 0                |
| F     | Re-add the cloudflared ingress entry and revert the 301. Apex redirect stays until 90-day window expires. | ≤ 90 days        |

## 6. What this plan does **not** change

- The GitHub repository name (`huliye24/MOOD`) — that decision belongs to the MOOD team
  and is documented separately.
- `package.json` `name` fields inside the repo (`mood-web`, `moodify-music`, `mood`) —
  these are migration inputs under `AGENTS.md` and are not renamed by this plan.
- The route layout on the website. `/token`, `/canon`, `/whitepaper`, and the future IA
  are a separate information-architecture task and are explicitly excluded from
  `MOOD WEB ORIGIN 001`.
- Wallet, token, treasury, governance, or any Phase Zero–out-of-scope work.

## 7. Open questions for the MOOD team

These are blockers that this plan does not answer and that should be answered before
Phase D starts:

1. Does the apex domain stay `crestwavecoin.com` for MOOD, or does it move?
2. Where do `rongjingmusic.com`, `rongjingwenchuan.com`, `play.rongjingmusic.com`, and
   `rongjinwenchuan.xyz` go? They are not part of MOOD but they share this origin.
3. Does the MOOD team want the staging subdomain (`mood.<apex>`) to outlive the apex
   move, or does it dissolve once the apex is migrated?
4. Is there an authority who can sign off on each phase, and is that signoff recorded
   somewhere the next agent can read?
