// Browser resource limits. Rust itself supports up to 20 customers, but this
// interactive exponential-time demo is deliberately capped at 12.
export const CVRP_LIMITS = Object.freeze({
  customers: { min: 2, max: 12 },
  vehicle_capacity: { min: 1, max: 100000 },
  max_vehicles: { min: 1, max: 12 },
  max_route_distance: { min: 1, max: 100000 },
  seed: { min: 0, max: 2147483647 },
  demand: { min: 1, max: 100000 },
  arc_distance: { min: 0, max: 100000 },
});

// Pure synthetic instances and the documented six-customer CVRP fixture.
export const DEFAULT_INSTANCE = {
  demands: [2, 4, 3, 4, 2, 3],
  distances: (() => {
    const matrix = Array.from({ length: 7 }, (_, i) =>
      Array.from({ length: 7 }, (_, j) => i === j ? 0 : 100));
    const arcs = [
      [0, 1, 4], [1, 2, 3], [2, 0, 6],
      [0, 3, 8], [3, 5, 4], [5, 0, 5],
      [0, 6, 3], [6, 4, 4], [4, 0, 7],
    ];
    for (const [i, j, distance] of arcs) matrix[i][j] = distance;
    return matrix;
  })(),
  vehicle_capacity: 7,
  max_vehicles: 3,
  max_route_distance: 18,
};

export function defaultInstance() {
  return JSON.parse(JSON.stringify(DEFAULT_INSTANCE));
}

function integer(value, lower, upper, name) {
  if (!Number.isSafeInteger(value) || value < lower || value > upper) {
    throw new Error(name + ' must be an integer between ' + lower + ' and ' + upper);
  }
  return value;
}

// Reproducible integer generator. Distances are synthetic, not road distances.
/**
 * Necessary and sufficient conditions for the SYNTHETIC instance constructor
 * below to provide a witness when demands >= 1 and all arcs >= 1.
 * This is not a proof of infeasibility for arbitrary user-entered matrices,
 * which may legally contain zero-cost arcs.
 */
export function sampleFeasibilityBarrier({ n, q, k, l }) {
  if (l < 2) return 'distance';
  if (n > q * k) return 'capacity';
  if (n > k * (l - 1)) return 'route-distance';
  return null;
}

// Deterministic synthetic generator with a CONSTRUCTIVE feasible witness.
// When the parameters can accommodate positive demands and distances, all
// generated sample routes are guaranteed to satisfy Q, K and L. The optimizer
// still computes the optimum; the witness is only used to build test data.
export function sampleInstance({ n, q, k, l, seed }) {
  integer(n, CVRP_LIMITS.customers.min, CVRP_LIMITS.customers.max, 'n');
  integer(q, CVRP_LIMITS.vehicle_capacity.min, CVRP_LIMITS.vehicle_capacity.max, 'Q');
  integer(k, CVRP_LIMITS.max_vehicles.min, Math.min(CVRP_LIMITS.max_vehicles.max, n), 'K');
  integer(l, CVRP_LIMITS.max_route_distance.min, CVRP_LIMITS.max_route_distance.max, 'L');
  integer(seed, CVRP_LIMITS.seed.min, CVRP_LIMITS.seed.max, 'seed');

  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };

  const feasible = sampleFeasibilityBarrier({ n, q, k, l }) === null;
  const groups = Array.from({ length: k }, () => []);
  for (let i = 0; i < n; i++) groups[i % k].push(i + 1);

  const demands = Array(n).fill(1);
  if (feasible) {
    for (const group of groups) {
      // At least one unit per customer; allocate extras without exceeding Q.
      let spare = q - group.length;
      for (const customer of group) {
        const extra = Math.floor(next() * (Math.min(spare, 3) + 1));
        demands[customer - 1] += extra;
        spare -= extra;
      }
    }
  }

  const points = [{ x: 0, y: 0 }];
  for (let i = 0; i < n; i++) {
    const angle = 2 * Math.PI * i / n + (next() - .5) * .35;
    const radius = 3 + next() * 3.5;
    points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
  }

  const raw = points.map((a, i) =>
    points.map((b, j) => i === j ? 0 :
      Math.max(1, Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 1.3))));

  // A group's witness route is 0 -> customers in group order -> 0.
  const routeLength = (group, factor) => {
    let previous = 0, total = 0;
    for (const customer of [...group, 0]) {
      if (customer !== previous) {
        total += Math.max(1, Math.floor(raw[previous][customer] * factor));
      }
      previous = customer;
    }
    return total;
  };

  let factor = 1;
  if (feasible && groups.some(group => routeLength(group, factor) > l)) {
    // Factor zero yields 1 per arc. For feasible constraints, even the
    // largest group has at most L-1 customers, so a feasible factor exists.
    let lower = 0, upper = 1;
    for (let iter = 0; iter < 40; iter++) {
      const middle = (lower + upper) / 2;
      if (groups.every(group => routeLength(group, middle) <= l)) {
        lower = middle;
      } else {
        upper = middle;
      }
    }
    factor = lower;
  }

  const distances = raw.map((row, i) =>
    row.map((distance, j) =>
      i === j ? 0 : Math.max(1, Math.floor(distance * factor))));

  return {
    demands,
    distances,
    vehicle_capacity: q,
    max_vehicles: k,
    max_route_distance: l,
  };
}
