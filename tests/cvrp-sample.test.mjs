import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_INSTANCE, defaultInstance, sampleInstance } from '../public/cvrp-sample.mjs';

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
