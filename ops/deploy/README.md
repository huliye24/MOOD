# MOOD website auto-deployment

## Production inventory

| Role | Value | Status |
| --- | --- | --- |
| Public website | `https://crestwavecoin.com/` | Canonical public entrance |
| Origin server | `103.144.246.242` | Reachable on TCP 22, 80, and 443 as of 2026-09-02 |
| Source | `https://github.com/huliye24/MOOD`, branch `main` | Public deployment source |
| Deployment root | `/opt/crestwave` | Managed by the server-side deployment service |
| Web service | `crestwave-web3.service` | Activated only after health checks |
| Sites project | `mood-world.fos33.chatgpt.site` | Private preview/fallback; not the official public website |

This inventory intentionally contains no passwords, private keys, tokens, or
other authentication material. Production access secrets belong in an approved
secret manager or an operator-controlled SSH agent, never in Git or Markdown.

The SSH login user is intentionally recorded as unresolved until it is verified
on the host. Do not infer it from the application service account `moodify`.

The production host polls the public `main` branch once per minute. A revision
is activated only after a clean dependency install, a self-hosted production
build, and HTTP checks for `/`, `/canon`, and `/protocol` on an isolated local
port. Activation uses the existing `/opt/crestwave/current` symlink and restores
the previous target if the production service cannot restart cleanly.

Server logs are available through:

```bash
journalctl -u mood-auto-deploy.service
```

To pause or resume automatic deployment:

```bash
systemctl disable --now mood-auto-deploy.timer
systemctl enable --now mood-auto-deploy.timer
```
