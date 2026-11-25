import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NODE_RADIUS, DEPOT_RADIUS, graphPositions, buildCvrpGraphLayout,
} from '../src/client/cvrp-graph-layout.mjs';

const overlap = (a, b, gap = 0) =>
  Math.abs(a.x - b.x) < a.halfWidth + b.halfWidth + gap &&
  Math.abs(a.y - b.y) < a.halfHeight + b.halfHeight + gap;

function pointSegmentDistance(p, a, b) {
  const vx = b.x - a.x, vy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) /
    (vx * vx + vy * vy || 1)));
  return Math.hypot(p.x - a.x - t * vx, p.y - a.y - t * vy);
}

function distanceToRoute(p, points) {
  let best = Infinity;
  for (let i = 1; i < points.length; i++)
    best = Math.min(best, pointSegmentDistance(p, points[i - 1], points[i]));
  return best;
}

function fixture(n, k, seed) {
  let state = seed * 777 + n * 13 + k;
  function random() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  }
  const customers = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [customers[j], customers[i]] = [customers[i], customers[j]];
  }
  const groups = Array.from({ length: k }, () => []);
  customers.forEach((client, i) => groups[i % k].push(client));
  const routes = groups.map(group => ({ stops: [0, ...group, 0] }));
  const distances = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === j ? 0 :
      (seed % 3 === 0 ? 100000 : Math.round(random() * 99999) + 1)));
  return { routes, distances, demands: Array(n).fill(100000) };
}

test('compact nodes, depot and curved route geometry are deterministic', () => {
  assert.equal(NODE_RADIUS, 20);
  assert.equal(DEPOT_RADIUS, 24);
  assert.equal(graphPositions(12).length, 13);
  assert.throws(() => graphPositions(13), /supports/);
  const input = fixture(6, 3, 7);
  const a = buildCvrpGraphLayout(input.demands, input.routes, input.distances);
  const b = buildCvrpGraphLayout(input.demands, input.routes, input.distances);
  assert.deepEqual(a, b);
  assert.equal(a.edges.length, 9);
  assert.equal(a.demandLabels.length, 7);
  assert.ok(a.edges.every(edge =>
    edge.path.startsWith('M ') && edge.path.includes(' Q ') &&
    edge.weight.halfHeight === 11));
  assert.ok(a.edges.some(edge => Math.abs(edge.bend) > 0));
});

test('route weights and demand labels avoid crossings, overlaps and SVG boundaries', () => {
  let checked = 0;
  // Hundreds of layout permutations including 12 customers, opposite-direction
  // depot legs, changing vehicle counts and 6-digit edge costs/demands.
  for (let n = 2; n <= 12; n++) {
    for (let k = 1; k <= Math.min(n, 6); k++) {
      for (const seed of [1, 3, 5]) {
        const input = fixture(n, k, seed);
        const result = buildCvrpGraphLayout(input.demands, input.routes, input.distances);
        assert.equal(result.positions.length, n + 1);
        assert.equal(result.demandLabels.length, n + 1);
        assert.equal(result.edges.length, n + k);
        const id = JSON.stringify({ n, k, seed });
        for (let i = 0; i < result.edges.length; i++) {
          const edge = result.edges[i];
          assert.ok(edge.weight.x > 9 && edge.weight.x < 891, id);
          assert.ok(edge.weight.y > 9 && edge.weight.y < 561, id);
          for (let j = i + 1; j < result.edges.length; j++)
            assert.equal(overlap(edge.weight, result.edges[j].weight, 2), false,
              id + ': diamonds ' + i + '/' + j);
          for (const other of result.edges) {
            if (other === edge) continue;
            assert.ok(distanceToRoute(edge.weight, other.points) >= 12,
              id + ': weight of ' + edge.from + '->' + edge.to +
              ' overlaps ' + other.from + '->' + other.to);
          }
        }
        for (let i = 1; i <= n; i++) {
          const label = result.demandLabels[i];
          assert.ok(label.x - label.halfWidth > 0 &&
            label.x + label.halfWidth < 900 &&
            label.y - label.halfHeight > 0 && label.y + label.halfHeight < 570, id);
          for (const weight of result.edges)
            assert.equal(overlap(label, weight.weight, 2), false, id + ': d=' + i);
          for (const edge of result.edges)
            assert.ok(distanceToRoute(label, edge.points) >= 10, id + ': d=' + i);
          for (let j = i + 1; j <= n; j++)
            assert.equal(overlap(label, result.demandLabels[j], 2), false, id);
        }
        checked++;
      }
    }
  }
  assert.ok(checked >= 150);
});

test('twelve two-way depot routes keep distinct weight diamonds', () => {
  const n = 12;
  const routes = Array.from({ length: n }, (_, i) => ({ stops: [0, i + 1, 0] }));
  const distances = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === j ? 0 : 100000));
  const layout = buildCvrpGraphLayout(Array(n).fill(100000), routes, distances);
  assert.equal(layout.edges.length, 24);
  for (let i = 0; i < 24; i++) {
    for (let j = i + 1; j < 24; j++)
      assert.equal(overlap(layout.edges[i].weight, layout.edges[j].weight, 2), false);
  }
});
