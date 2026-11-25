import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_INSTANCE, defaultInstance, sampleInstance, sampleFeasibilityBarrier } from '../src/client/cvrp-sample.mjs';

test('default fixture includes all six clients and complete directed matrix', () => {
  const i = defaultInstance();
  assert.deepEqual(i.demands, [2, 4, 3, 4, 2, 3]);
  assert.equal(i.vehicle_capacity, 7);
  assert.equal(i.max_vehicles, 3);
  assert.equal(i.max_route_distance, 18);
  assert.equal(i.distances.length, 7);
  assert.ok(i.distances.every(row => row.length === 7));
  assert.equal(i.distances[0][1] + i.distances[1][2] + i.distances[2][0], 13);
  assert.equal(i.distances[0][3] + i.distances[3][5] + i.distances[5][0], 17);
  assert.equal(i.distances[0][6] + i.distances[6][4] + i.distances[4][0], 14);
  assert.equal(i.distances[0][4], 100);
});

test('synthetic generation is reproducible by seed', () => {
  const args = { n: 10, q: 9, k: 4, l: 35, seed: 1234 };
  assert.deepEqual(sampleInstance(args), sampleInstance(args));
  assert.notDeepEqual(sampleInstance(args), sampleInstance({ ...args, seed: 4321 }));
});

test('generated inputs respect requested sizes and bounds', () => {
  const i = sampleInstance({ n: 12, q: 2, k: 3, l: 20, seed: 0 });
  assert.equal(i.demands.length, 12);
  assert.ok(i.demands.every(d => d >= 1 && d <= 2));
  assert.equal(i.distances.length, 13);
  assert.ok(i.distances.every(row => row.length === 13));
  assert.ok(i.distances.every((row, n) => row[n] === 0));
  assert.equal(i.max_vehicles, 3);
  assert.equal(i.max_route_distance, 20);
});

test('default fixture is copied, not mutated', () => {
  const instance = defaultInstance();
  instance.distances[0][1] = 999;
  assert.equal(DEFAULT_INSTANCE.distances[0][1], 4);
  assert.equal(defaultInstance().distances[0][1], 4);
});

test('reject too many customers and invalid capacity', () => {
  assert.throws(() => sampleInstance({ n: 100, q: 5, k: 1, l: 10, seed: 1 }), /between/);
  assert.throws(() => sampleInstance({ n: 2, q: 0, k: 1, l: 10, seed: 1 }), /between/);
});


test('browser input boundaries reject values the demo cannot safely process', () => {
  const base = { n: 12, q: 100000, k: 12, l: 100000, seed: 2147483647 };
  const maximal = sampleInstance(base);
  assert.equal(maximal.demands.length, 12);
  assert.equal(maximal.vehicle_capacity, 100000);
  assert.equal(maximal.max_route_distance, 100000);
  assert.throws(() => sampleInstance({ ...base, n: 13 }), /between/);
  assert.throws(() => sampleInstance({ ...base, n: 1 }), /between/);
  assert.throws(() => sampleInstance({ ...base, q: 100001 }), /between/);
  assert.throws(() => sampleInstance({ ...base, q: 0 }), /between/);
  assert.throws(() => sampleInstance({ ...base, k: 0 }), /between/);
  assert.throws(() => sampleInstance({ ...base, n: 2, k: 3 }), /between/);
  assert.throws(() => sampleInstance({ ...base, l: 100001 }), /between/);
  assert.throws(() => sampleInstance({ ...base, seed: 2147483648 }), /between/);
  assert.throws(() => sampleInstance({ ...base, seed: -1 }), /between/);
});


test('regression: synthetic samples have a feasible route partition whenever limits allow it', () => {
  let feasibleCases = 0;
  let impossibleCases = 0;
  // Combinatorial coverage of demand, fleet, distance, seed and customer count.
  // The witness is checked independently of the Rust solver and generator internals.
  for (let n = 2; n <= 12; n++) {
    for (let k = 1; k <= Math.min(n, 5); k++) {
      for (const q of [1, 2, 3, 4, 7, 12]) {
        for (const l of [1, 2, 3, 5, 9, 18, 45]) {
          for (const seed of [0, 7, 42]) {
            const args = { n, q, k, l, seed };
            const input = sampleInstance(args);
            const barrier = sampleFeasibilityBarrier(args);
            assert.equal(input.demands.length, n);
            assert.equal(input.distances.length, n + 1);
            assert.ok(input.distances.every((row, i) =>
              row.length === n + 1 && row[i] === 0 &&
              row.every((cost, j) => i === j || (Number.isInteger(cost) && cost >= 1))));
            if (barrier !== null) {
              impossibleCases++;
              assert.ok(l < 2 || k * Math.min(q, l - 1) < n);
              continue;
            }
            feasibleCases++;
            let covered = 0;
            // Independently reconstruct the round-robin witness that the
            // instance generator promises, and check every exact constraint.
            for (let route = 0; route < k; route++) {
              const customers = Array.from({ length: n }, (_, i) => i + 1)
                .filter(customer => (customer - 1) % k === route);
              const load = customers.reduce((sum, c) => sum + input.demands[c - 1], 0);
              const stops = [0, ...customers, 0];
              const length = stops.slice(1)
                .reduce((sum, dest, j) => sum + input.distances[stops[j]][dest], 0);
              assert.ok(load <= q,
                'Capacity violation: ' + JSON.stringify({ args, route, load }));
              assert.ok(length <= l,
                'Route-length violation: ' + JSON.stringify({ args, route, length }));
              covered += customers.length;
            }
            assert.equal(covered, n);
          }
        }
      }
    }
  }
  assert.ok(feasibleCases > 1000);
  assert.ok(impossibleCases > 1000);
});

test('regression: seed 7, Q=7, K=3 and L=18 stays feasible for 7–12 clients', () => {
  for (let n = 7; n <= 12; n++) {
    const args = { n, q: 7, k: 3, l: 18, seed: 7 };
    const input = sampleInstance(args);
    assert.equal(sampleFeasibilityBarrier(args), null);
    const total = input.demands.reduce((sum, d) => sum + d, 0);
    assert.ok(total <= 21, JSON.stringify({ n, total, demands: input.demands }));
  }
});

test('an impossible synthetic parameter combination is reported rather than silently fabricated', () => {
  assert.equal(sampleFeasibilityBarrier({ n: 10, q: 2, k: 3, l: 18 }), 'capacity');
  assert.equal(sampleFeasibilityBarrier({ n: 10, q: 10, k: 3, l: 3 }), 'route-distance');
  assert.equal(sampleFeasibilityBarrier({ n: 3, q: 7, k: 3, l: 1 }), 'distance');
});
