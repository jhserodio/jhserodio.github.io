// Runtime smoke test: load the actual compiled WebAssembly module in Node.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import init, { solve } from '../public/wasm/cvrp-solver/cvrp_solver_wasm.js';
import { defaultInstance, sampleInstance, sampleFeasibilityBarrier } from '../src/client/cvrp-sample.mjs';

const wasm = await readFile(new URL(
  '../public/wasm/cvrp-solver/cvrp_solver_wasm_bg.wasm', import.meta.url,
));
await init(wasm);

const instance = defaultInstance();
const result = JSON.parse(solve(JSON.stringify(instance)));
assert.equal(result.status, 'optimal');
assert.equal(result.total_distance, '44');
assert.equal(result.routes.length, 3);
const visited = result.routes.flatMap(route => route.stops.filter(client => client !== 0));
assert.deepEqual(visited.sort((a, b) => a - b), [1, 2, 3, 4, 5, 6]);
assert.ok(result.routes.every(route =>
  route.demand <= instance.vehicle_capacity &&
  route.distance <= instance.max_route_distance &&
  route.stops[0] === 0 &&
  route.stops.at(-1) === 0
));
console.log('[wasm] Smoke test passed: Rust optimum = 44, three feasible routes.');


// Guard against "Worker finished but SVG has no edges" false positives.
// Run the real compiled WASM on the same synthetic inputs used by the frontend.
let verified = 0;
for (const [n, q, k, l, seed] of [
  [7,7,3,18,7], [8,7,3,18,7], [9,7,3,18,7],
  [10,7,3,18,7], [11,7,3,18,7], [12,7,3,18,7],
  [12,7,3,18,42], [12,10,4,12,42], [6,7,3,18,123],
  [5,3,2,8,7], [4,1,4,2,42], [3,1,3,2,0],
]) {
  const args = { n, q, k, l, seed };
  assert.equal(sampleFeasibilityBarrier(args), null);
  const sample = sampleInstance(args);
  const answer = JSON.parse(solve(JSON.stringify(sample)));
  assert.equal(answer.status, 'optimal', 'Expected routes: ' + JSON.stringify(args));
  assert.ok(answer.routes.length > 0 && answer.routes.length <= k);
  assert.ok(answer.routes.every(route =>
    route.stops[0] === 0 && route.stops.at(-1) === 0 &&
    route.stops.length >= 3 && route.demand <= q && route.distance <= l));
  const allClients = answer.routes.flatMap(route => route.stops.slice(1, -1))
    .sort((a,b) => a - b);
  assert.deepEqual(allClients, Array.from({ length: n }, (_, i) => i + 1));
  const sum = answer.routes.reduce((acc, route) => acc + BigInt(route.distance), 0n);
  assert.equal(sum.toString(), answer.total_distance);
  verified++;
}
console.log('[wasm] Verified exact routes for ' + verified + ' regenerated browser fixtures.');

const impossible = sampleInstance({ n: 10, q: 2, k: 3, l: 18, seed: 7 });
assert.equal(JSON.parse(solve(JSON.stringify(impossible))).status, 'infeasible');
