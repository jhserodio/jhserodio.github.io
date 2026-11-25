// Runtime smoke test: load the actual compiled WebAssembly module in Node.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import init, { solve } from '../public/wasm/cvrp-solver/cvrp_solver_wasm.js';
import { defaultInstance } from '../public/cvrp-sample.mjs';

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
