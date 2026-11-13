#!/usr/bin/env bash
# Full playthrough runner: replays the MAIN-PATH files design/solutions/fullrun/NNN[a-z]-*.json in name order in ONE page
# (no reloads, no jumps), each with tools/fullrun-play.sh.  Usage:  bash tools/fullrun.sh <session> [from] [to]
#   from/to are filename prefixes of any length (e.g. 016, 051z); a file is run when from <= name and name <= to
#   (a name that starts with `to` counts as <= to). Retry, resume and archive files (run1/, resume/) are never run.
# Stops at the first file whose replay reports an error. Appends to design/solutions/fullrun/run.log.
set -uo pipefail
S="$1"; FROM="${2:-000}"; TO="${3:-999}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"; FR="$DIR/design/solutions/fullrun"; LOG="$FR/run.log"
for f in "$FR"/*.json; do
  b="$(basename "$f")"
  [[ "$b" =~ ^[0-9]{3}[a-z]?-.*\.json$ ]] || continue
  [[ "$b" < "$FROM" ]] && continue
  if [[ "$b" > "$TO" && "$b" != "$TO"* ]]; then break; fi
  t0=$(date +%s)
  out="$(bash "$DIR/tools/fullrun-play.sh" "$S" "$f")"
  scr="$(playwright-cli -s="$S" eval "window.__game.state().screen" 2>&1 | sed -n '2p' | tr -d '"')"
  if [ "$scr" = "chapter" ]; then playwright-cli -s="$S" screenshot --filename="$DIR/design/screenshots/fullrun2-${b%.json}.png" >/dev/null 2>&1; echo "  (chapter card screenshot: design/screenshots/fullrun2-${b%.json}.png)" | tee -a "$LOG"; fi
  st="$(playwright-cli -s="$S" eval "(()=>{const s=window.__game.state();return JSON.stringify({map:s.map,tile:s.tile,t:Math.round(s.playTime),lv:s.members.bramble&&s.members.bramble.lvl,btn:s.buttons,party:s.party,quest:s.quest})})()" 2>&1 | sed -n '2p')"
  echo "$(date +%H:%M:%S) $b ($(( $(date +%s) - t0 ))s) $(echo "$out" | tr -d '\n' | cut -c1-600) STATE $st" | tee -a "$LOG"
  if echo "$out" | grep -q '"error"' || ! echo "$out" | grep -q '"steps"'; then echo "STOPPED at $b"; exit 1; fi
done
echo "DONE through $TO"
