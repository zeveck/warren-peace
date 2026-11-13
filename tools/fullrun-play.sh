#!/usr/bin/env bash
# Like tools/play.sh --no-jump, plus the {"goto": [x, y]} step (tools/fullrun-goto.js). Never jumps.
set -euo pipefail
S="$1"; SOL="$2"
DIR="$(cd "$(dirname "$0")" && pwd)"
CODE="async page => {
$(cat "$DIR/play.js")
$(cat "$DIR/fullrun-goto.js")
const SOL = $(cat "$SOL");
return await runAll(SOL.steps);
}"
playwright-cli -s="$S" run-code "$CODE" 2>&1 | sed -n '/### Result/,/### Ran/p' | grep -v '^###'
