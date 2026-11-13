// A* on 4 neighbours: cost 1 per hop + 0.5 per height change, capped at 4000 expanded nodes.
// canStep(fx, fy, tx, ty) says whether a hop is allowed.
export function findPath(sx, sy, tx, ty, canStep, heightAt, cap = 4000) {
  if (sx === tx && sy === ty) return [];
  const key = (x, y) => x * 4096 + y;
  const open = [{ x: sx, y: sy, g: 0, f: Math.abs(tx - sx) + Math.abs(ty - sy) }];
  const came = new Map(), gs = new Map([[key(sx, sy), 0]]);
  let n = 0;
  while (open.length && n++ < cap) {
    let bi = 0; for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
    const cur = open.splice(bi, 1)[0];
    if (cur.x === tx && cur.y === ty) {
      const path = []; let k = key(cur.x, cur.y);
      while (came.has(k)) { const c = came.get(k); path.unshift({ x: Math.floor(k / 4096), y: k % 4096 }); k = c; }
      return path;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (!canStep(cur.x, cur.y, nx, ny)) continue;
      const g = cur.g + 1 + 0.5 * Math.abs(heightAt(nx, ny) - heightAt(cur.x, cur.y));
      const k = key(nx, ny);
      if (gs.has(k) && gs.get(k) <= g) continue;
      gs.set(k, g); came.set(k, key(cur.x, cur.y));
      open.push({ x: nx, y: ny, g, f: g + Math.abs(tx - nx) + Math.abs(ty - ny) });
    }
  }
  return null;
}
