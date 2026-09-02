#!/bin/bash
# MOOD staging deploy script - runs install:ci then build:self-hosted
set -uo pipefail  # NOT -e so we keep going on warnings

export PATH=/opt/node22/bin:$PATH
RELEASE=/opt/crestwave/staging/releases/20260831T151500Z-835c8f9
APPDIR=$RELEASE/apps/web
LOG=/opt/crestwave/staging/deploy.log

cd "$APPDIR"
echo "=== ENV $(date -u) ===" > $LOG
echo "node: $(node --version)" >> $LOG
echo "npm: $(npm --version)" >> $LOG
echo "" >> $LOG

echo "=== INSTALL:CI START $(date -u) ===" >> $LOG
bash scripts/install-ci.sh >> $LOG 2>&1
RC1=$?
echo "=== INSTALL:CI END $(date -u) RC=$RC1 ===" >> $LOG

if [[ $RC1 -eq 0 ]]; then
  echo "" >> $LOG
  echo "=== BUILD:SH START $(date -u) ===" >> $LOG
  bash scripts/build-self-hosted.sh >> $LOG 2>&1
  RC2=$?
  echo "=== BUILD:SH END $(date -u) RC=$RC2 ===" >> $LOG
fi

echo "DEPLOY_DONE_AT_$(date -u)" >> $LOG
