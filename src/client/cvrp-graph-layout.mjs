// Browser-independent CVRP layout. All coordinates are in the 900x570 SVG viewBox.
const WIDTH = 900;
const HEIGHT = 570;
export const NODE_RADIUS = 20;
export const DEPOT_RADIUS = 24;
const MID = { x: 450, y: 283 };
const BENDS = [24, -24, 48, -48, 0, 76, -76, 110, -110, 150, -150, 200, -200];
const T_VALUES = [0.5, 0.36, 0.64, 0.27, 0.73, 0.43, 0.57, 0.18, 0.82, 0.12, 0.88];
const length = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const distancePointSegment = (point, a, b) => {
  const vx = b.x - a.x, vy = b.y - a.y;
  const t = Math.max(0, Math.min(1,
    ((point.x - a.x) * vx + (point.y - a.y) * vy) / (vx * vx + vy * vy || 1)));
  return Math.hypot(point.x - a.x - t * vx, point.y - a.y - t * vy);
};
const sampleQuadratic = (a, c, b, t) => {
  const s = 1 - t;
  return { x: s * s * a.x + 2 * s * t * c.x + t * t * b.x,
    y: s * s * a.y + 2 * s * t * c.y + t * t * b.y };
};
const minToPolyline = (point, points) => {
  let min = Infinity;
  for (let i = 1; i < points.length; i++) {
    min = Math.min(min, distancePointSegment(point, points[i - 1], points[i]));
  }
  return min;
};
const boxOverlap = (a, b, gap = 0) =>
  Math.abs(a.x - b.x) < a.halfWidth + b.halfWidth + gap &&
  Math.abs(a.y - b.y) < a.halfHeight + b.halfHeight + gap;

export function graphPositions(n) {
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new RangeError('CVRP graph supports 1–12 clients');
  return [MID, ...Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + i * (Math.PI * 2 / n);
    return { x: MID.x + 348 * Math.cos(angle), y: MID.y + 212 * Math.sin(angle) };
  })];
}

function makeCurve(edge, bend, positions) {
  const from = positions[edge.from], to = positions[edge.to];
  const dx = to.x - from.x, dy = to.y - from.y;
  const norm = Math.hypot(dx, dy) || 1;
  const control = { x: (from.x + to.x) / 2 - dy / norm * bend,
    y: (from.y + to.y) / 2 + dx / norm * bend };
  const us = { x: (control.x - from.x) / (length(control, from) || 1),
    y: (control.y - from.y) / (length(control, from) || 1) };
  const ut = { x: (control.x - to.x) / (length(control, to) || 1),
    y: (control.y - to.y) / (length(control, to) || 1) };
  const r1 = (edge.from === 0 ? DEPOT_RADIUS : NODE_RADIUS) + 2;
  const r2 = (edge.to === 0 ? DEPOT_RADIUS : NODE_RADIUS) + 7;
  const a = { x: from.x + us.x * r1, y: from.y + us.y * r1 };
  const b = { x: to.x + ut.x * r2, y: to.y + ut.y * r2 };
  const points = Array.from({ length: 25 }, (_, i) => sampleQuadratic(a, control, b, i / 24));
  return {
    ...edge, a, b, control, bend, points,
    path: 'M ' + a.x.toFixed(2) + ' ' + a.y.toFixed(2) +
      ' Q ' + control.x.toFixed(2) + ' ' + control.y.toFixed(2) +
      ' ' + b.x.toFixed(2) + ' ' + b.y.toFixed(2),
  };
}

function routeCost(candidate, accepted, positions) {
  let score = Math.abs(candidate.bend) * .013;
  for (const p of candidate.points) {
    const side = Math.min(p.x - 14, WIDTH - p.x - 14, p.y - 14, HEIGHT - p.y - 14);
    if (side < 0) score += 4 + (-side) ** 2 * .05;
  }
  for (let i = 0; i < positions.length; i++) {
    if (i === candidate.from || i === candidate.to) continue;
    const d = minToPolyline(positions[i], candidate.points);
    const radius = i === 0 ? DEPOT_RADIUS : NODE_RADIUS;
    if (d < radius + 11) score += (radius + 11 - d) ** 2 * 5;
  }
  // Route paths sharing a depot must separate after they exit its boundary.
  for (const old of accepted) {
    const shared = [candidate.from, candidate.to].filter(x => x === old.from || x === old.to);
    for (const p of candidate.points) {
      if (shared.some(i => length(p, positions[i]) < 42)) continue;
      const d = minToPolyline(p, old.points);
      // Bidirectional depot legs need wider lanes for both arrow and weight.
      const clearance = old.from === candidate.to && old.to === candidate.from ? 30 : 13;
      if (d < clearance) score += (clearance - d) ** 2 * .9;
    }
  }
  return score;
}

function labelCost(box, ownEdge, edges, positions, already = []) {
  let score = 0;
  const side = Math.min(box.x - box.halfWidth - 9, WIDTH - box.x - box.halfWidth - 9,
    box.y - box.halfHeight - 9, HEIGHT - box.y - box.halfHeight - 9);
  if (side < 0) score += 1000 + side ** 2 * 15;
  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    const d = Math.hypot(Math.max(0, Math.abs(box.x - p.x) - box.halfWidth),
      Math.max(0, Math.abs(box.y - p.y) - box.halfHeight));
    const radius = i === 0 ? DEPOT_RADIUS : NODE_RADIUS;
    if (d < radius + 6) score += 250 + (radius + 6 - d) ** 2 * 8;
  }
  for (const prior of already) {
    if (boxOverlap(box, prior, 6)) score += 5000;
    else if (boxOverlap(box, prior, 17)) score += 80;
  }
  // A diamond must not cover the path of another vehicle.
  for (const edge of edges) {
    if (edge === ownEdge) continue;
    const d = minToPolyline(box, edge.points);
    const r = Math.max(box.halfHeight, Math.min(box.halfWidth, 22));
    if (d < r + 5) score += 180 + (r + 5 - d) ** 2 * 6;
  }
  return score;
}

function placeWeights(edges, positions) {
  const pending = [...edges].sort((a, b) => length(b.a, b.b) - length(a.a, a.b));
  function bestWeight(edge, others) {
    const txt = String(edge.cost);
    const halfWidth = Math.max(14, 7 + txt.length * 4.5), halfHeight = 11;
    let best = null, bestScore = Infinity;
    for (const t of T_VALUES) {
      const p = sampleQuadratic(edge.a, edge.control, edge.b, t);
      const tangent = {
        x: (1 - t) * (edge.control.x - edge.a.x) + t * (edge.b.x - edge.control.x),
        y: (1 - t) * (edge.control.y - edge.a.y) + t * (edge.b.y - edge.control.y),
      };
      const norm = Math.hypot(tangent.x, tangent.y) || 1;
      // A small perpendicular lane shift keeps the diamond touching its edge
      // while allowing two nearby directed paths to display separate costs.
      for (const shift of [0, -5, 5, -9, 9]) {
        const candidate = {
          x: p.x - tangent.y / norm * shift,
          y: p.y + tangent.x / norm * shift,
          halfWidth, halfHeight, t, shift,
        };
        const score = labelCost(candidate, edge, edges, positions, others) +
          Math.abs(t - .5) * 4 + Math.abs(shift) * .25;
        if (score < bestScore) { best = candidate; bestScore = score; }
      }
    }
    return best;
  }
  const reserved = [];
  for (const edge of pending) {
    edge.weight = bestWeight(edge, reserved);
    reserved.push(edge.weight);
  }
  // Revisit each placement with the complete set of weights. A fixed-order
  // greedy pass can otherwise trap two diamonds in the same intersection.
  for (let sweep = 0; sweep < 3; sweep++) {
    for (const edge of [...pending].reverse()) {
      const others = pending.filter(other => other !== edge).map(other => other.weight);
      edge.weight = bestWeight(edge, others);
    }
  }
  return edges.map(edge => edge.weight);
}

function placeDemands(positions, edges, weights, demands) {
  const occupied = [];
  return positions.map((p, node) => {
    if (node === 0) return null;
    const txt = 'd=' + demands[node - 1];
    const halfWidth = Math.max(15, txt.length * 3.6);
    const halfHeight = 9;
    // Try above, flanks, below and diagonals, preferring open exterior space.
    const dirs = [[0,-1],[1,0],[-1,0],[0,1],[1,-1],[-1,-1],[1,1],[-1,1],
      [.5,-1],[-.5,-1],[.5,1],[-.5,1]];
    let best = null, bestScore = Infinity;
    const radial = { x: (p.x - MID.x) / 348, y: (p.y - MID.y) / 212 };
    for (let i = 0; i < dirs.length; i++) {
      const [rawX, rawY] = dirs[i];
      const norm = Math.hypot(rawX, rawY);
      const dx = rawX / norm, dy = rawY / norm;
      for (const extension of [0, 12, 24, 36]) {
        const candidate = {
          x: p.x + dx * (NODE_RADIUS + 22 + extension + (Math.abs(dx) > .6 ? halfWidth * .18 : 0)),
          y: p.y + dy * (NODE_RADIUS + 20 + extension), halfWidth, halfHeight,
        };
        let score = labelCost(candidate, null, edges, positions, [...weights, ...occupied]);
        score += 2.3 * (1 - (dx * radial.x + dy * radial.y)) + i * .02 + extension * .07;
        if (score < bestScore) { bestScore = score; best = candidate; }
      }
    }
    occupied.push(best);
    return best;
  });
}

export function buildCvrpGraphLayout(demands, routes = [], distances = []) {
  const positions = graphPositions(demands.length);
  const edges = [];
  for (let routeIndex = 0; routeIndex < routes.length; routeIndex++) {
    const stops = routes[routeIndex].stops || [];
    for (let step = 0; step + 1 < stops.length; step++) {
      const from = stops[step], to = stops[step + 1];
      if (!positions[from] || !positions[to] || from === to) continue;
      const edge = { from, to, routeIndex, step, cost: distances[from]?.[to] ?? '?' };
      let best = null, bestCost = Infinity;
      for (const bend of BENDS) {
        const candidate = makeCurve(edge, bend, positions);
        const cost = routeCost(candidate, edges, positions);
        if (cost < bestCost) { best = candidate; bestCost = cost; }
      }
      edges.push(best);
    }
  }
  const weights = placeWeights(edges, positions);
  const demandLabels = placeDemands(positions, edges, weights, demands);
  return { positions, edges, demandLabels };
}
