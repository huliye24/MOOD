#!/bin/bash
set -euo pipefail

RELEASE=/opt/crestwave/staging/releases/20260831T151500Z-835c8f9
APPDIR=$RELEASE/apps/web
LOGFILE=/opt/crestwave/staging/staging.log
BINDIR=/opt/node22/bin
export PATH=$BINDIR:$PATH

echo "[$(date)] ===== STAGING DEPLOY START =====" >> $LOGFILE

# Check scripts
echo "[$(date)] Scripts:" >> $LOGFILE
ls $APPDIR/scripts/ >> $LOGFILE 2>&1

# Read build script
echo "[$(date)] Build script:" >> $LOGFILE
cat $APPDIR/scripts/build-verified.sh >> $LOGFILE 2>&1

echo "[$(date)] ===== BUILD END =====" >> $LOGFILE
echo "DONE" >> $LOGFILE
