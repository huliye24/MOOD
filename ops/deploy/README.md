# MOOD website auto-deployment

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
