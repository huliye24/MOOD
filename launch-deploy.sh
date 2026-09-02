#!/bin/bash
# Launcher: start deploy script detached
rm -f /opt/crestwave/staging/deploy.log /opt/crestwave/staging/console.log
nohup /tmp/deploy-mood-staging.sh >/opt/crestwave/staging/console.log 2>&1 </dev/null &
disown
sleep 2
echo "LAUNCHED_PID=$!"
pgrep -af deploy-mood
