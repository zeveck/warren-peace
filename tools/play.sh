#!/usr/bin/env bash
# Replay a solution with real input:  bash tools/play.sh <session> <solution.json> [--no-jump]
# The solution file is {"segment": "<segment id>", "steps": [...]} (see tools/play.js).
# Without --no-jump it first jumps to the segment with window.__game.goToLevel (the allowed jump).
set -euo pipefail
S="$1"; SOL="$2"; JUMP=1; [ "${3:-}" = "--no-jump" ] && JUMP=0
DIR="$(cd "$(dirname "$0")" && pwd)"
CODE="async page => {
$(cat "$DIR/play.js")
const SOL = $(cat "$SOL");
if ($JUMP) {
  const lv = await page.evaluate(() => window.__game.levels());
  const seg = lv.find(l => l.id === SOL.segment);
  if (!seg) return { ok: false, error: 'no segment ' + SOL.segment };
  await page.evaluate(n => window.__game.goToLevel(n), seg.n);
  await page.waitForTimeout(1200);
}
return await run(SOL.steps);
}"
playwright-cli -s="$S" run-code "$CODE" 2>&1 | sed -n '/### Result/,/### Ran/p' | grep -v '^###'
