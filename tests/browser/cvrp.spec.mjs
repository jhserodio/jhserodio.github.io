import { test, expect } from '@playwright/test';

const route = lang => '/' + lang + '/apps/cvrp-solver/';
const inputs = {
  n: '[data-cvrp-n]', q: '[data-cvrp-q]', k: '[data-cvrp-k]',
  l: '[data-cvrp-l]', seed: '[data-cvrp-seed]',
};
const root = '[data-cvrp-root]';
const overlay = '[data-cvrp-overlay]';
const status = '[data-cvrp-status]';
const graph = '[data-cvrp-graph]';
const results = '[data-cvrp-results]';
const json = '[data-cvrp-json]';
const resolve = '[data-cvrp-run]';

async function changeNumber(page, name, value) {
  const field = page.locator(inputs[name]);
  await field.fill(String(value));
  await field.press('Tab');
}

async function unsolved(page, count) {
  await expect(page.locator(graph + ' circle')).toHaveCount(count);
  await expect(page.locator(graph + ' line')).toHaveCount(0);
  await expect(page.locator(graph + ' polygon')).toHaveCount(0);
  await expect(page.locator(results)).toBeEmpty();
  await expect(page.locator(overlay)).toBeHidden();
}

async function finished(page) {
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator(resolve)).toBeEnabled();
  await expect(page.locator(status)).toContainText(/Optimal solution|Solução ótima/);
  // A "completed but infeasible" Worker is NOT success for a sample that
  // was deliberately generated with a feasible witness.
  await expect(page.locator('.cvrp-route').first()).toBeVisible();
  const edgeCount = await page.locator(graph + ' line').count();
  expect(edgeCount).toBeGreaterThan(0);
  await expect(page.locator(graph + ' polygon')).toHaveCount(edgeCount);
}

// Deterministic Worker for UI/lifecycle tests. Actual WASM is tested separately.
async function mockWorker(page, delay = 220) {
  await page.addInitScript(ms => {
    window.__cvrpWorkers = [];
    window.Worker = class FakeWorker {
      constructor() {
        this.terminated = false;
        window.__cvrpWorkers.push(this);
      }
      postMessage(message) {
        this.payload = message;
        const callback = this.onmessage;
        setTimeout(() => callback?.({ data: {
          id: message.id,
          result: {
            status: 'optimal',
            total_distance: '123',
            routes: [{
              stops: [0, 1, 0],
              demand: message.instance.demands[0],
              distance: message.instance.distances[0][1] +
                message.instance.distances[1][0],
            }],
          },
        } }), ms);
      }
      terminate() { this.terminated = true; }
    };
  }, delay);
}

test('bilingual pages start with nodes only, default parameters and one Resolve button', async ({ page }) => {
  for (const lang of ['en', 'pt']) {
    await page.goto(route(lang));
    await expect(page.locator(root)).toBeVisible();
    await expect(page.locator('.cvrp-back')).toHaveAttribute('href', 'https://serodio.dev/en/apps/');
    await expect(page.locator(resolve)).toHaveAttribute('type', 'button');
    await expect(page.locator(resolve)).toBeEnabled();
    await expect(page.locator('[data-cvrp-generate]')).toHaveCount(0);
    await expect(page.locator(inputs.n)).toHaveValue('6');
    await expect(page.locator(inputs.q)).toHaveValue('7');
    await expect(page.locator(inputs.k)).toHaveValue('3');
    await expect(page.locator(inputs.l)).toHaveValue('18');
    await expect(page.locator(inputs.seed)).toHaveValue('7');
    expect(JSON.parse(await page.locator(json).inputValue()).demands).toHaveLength(6);
    await unsolved(page, 7);
  }
});

test('clicking Resolve runs compiled Rust/WASM, shows nine arcs and cost 44', async ({ page }) => {
  await page.goto(route('en'));
  await unsolved(page, 7);
  await page.locator(resolve).click();
  await expect(page.locator(status)).toContainText('Optimal solution found by Rust');
  await expect(page.locator(results)).toContainText('44');
  await expect(page.locator('.cvrp-route')).toHaveCount(3);
  await expect(page.locator(graph + ' line')).toHaveCount(9);
  await expect(page.locator(graph + ' polygon')).toHaveCount(9);
  await finished(page);
});

test('changing every parameter clears edges and results immediately, then manual Resolve runs WASM again', async ({ page }) => {
  await page.goto(route('en'));
  await page.locator(resolve).click();
  await finished(page);
  for (const [name, value] of [
    ['l', 45], ['q', 12], ['n', 7], ['seed', 17],
    ['k', 5], ['n', 5], ['q', 8], ['k', 3],
    ['l', 50], ['seed', 99], ['n', 6], ['q', 7],
  ]) {
    await changeNumber(page, name, value);
    const instance = JSON.parse(await page.locator(json).inputValue());
    if (name === 'n') expect(instance.demands).toHaveLength(value);
    if (name === 'q') expect(instance.vehicle_capacity).toBe(value);
    if (name === 'k') expect(instance.max_vehicles).toBe(value);
    if (name === 'l') expect(instance.max_route_distance).toBe(value);
    await unsolved(page, instance.demands.length + 1);
    await expect(page.locator(resolve)).toBeEnabled();
    await page.locator(resolve).click();
    await finished(page);
  }
});

test('cross-ordered edits rebuild nodes and JSON but never spawn Worker without Resolve', async ({ page }) => {
  await mockWorker(page, 85);
  await page.goto(route('en'));
  await page.locator(resolve).click();
  await expect(page.locator(results)).toContainText('123');
  for (const [name, value] of [
    ['n', 4], ['seed', 4], ['q', 8], ['k', 4], ['l', 60],
    ['n', 6], ['q', 15], ['seed', 7], ['k', 3], ['l', 90],
  ]) {
    const before = await page.evaluate(() => window.__cvrpWorkers.length);
    await changeNumber(page, name, value);
    const instance = JSON.parse(await page.locator(json).inputValue());
    await unsolved(page, instance.demands.length + 1);
    expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(before);
    await page.locator(resolve).click();
    await expect(page.locator(results)).toContainText('123');
    expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(before + 1);
  }
});

test('multiple parameter changes before Resolve preserve only current nodes', async ({ page }) => {
  await mockWorker(page, 90);
  await page.goto(route('en'));
  await page.locator(resolve).click();
  await expect(page.locator(results)).toContainText('123');
  const countBefore = await page.evaluate(() => window.__cvrpWorkers.length);
  for (const [name, value] of [
    ['q', 17], ['n', 10], ['l', 75], ['seed', 42], ['k', 5],
    ['n', 8], ['q', 9], ['l', 90], ['seed', 100],
  ]) {
    await changeNumber(page, name, value);
    await unsolved(page, name === 'n' ? value + 1 : (await page.locator(inputs.n).inputValue()) * 1 + 1);
    expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(countBefore);
  }
  await page.locator(resolve).click();
  await expect(page.locator(results)).toContainText('123');
  const submitted = await page.evaluate(() => window.__cvrpWorkers.at(-1).payload.instance);
  expect(submitted.demands).toHaveLength(8);
  expect(submitted.vehicle_capacity).toBe(9);
  expect(submitted.max_route_distance).toBe(90);
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(countBefore + 1);
});

test('manual JSON changes clear solved edges, accept new values and handle invalid content', async ({ page }) => {
  await page.goto(route('pt'));
  await page.locator(resolve).click();
  await expect(page.locator(results)).toContainText('44');
  const field = page.locator(json);
  const instance = JSON.parse(await field.inputValue());
  instance.vehicle_capacity = 1;
  await field.fill(JSON.stringify(instance));
  await unsolved(page, 7);
  await expect(page.locator(resolve)).toBeEnabled();
  await page.locator(resolve).click();
  await expect(page.locator(status)).toContainText('Instância inviável');
  await expect(page.locator('.cvrp-infeasible')).toBeVisible();
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator(graph + ' line')).toHaveCount(0);
  await expect(page.locator(graph + ' polygon')).toHaveCount(0);

  await field.fill('{ invalid JSON }');
  await unsolved(page, 7);
  await expect(page.locator(resolve)).toBeDisabled();
  await expect(page.locator(status)).toContainText('JSON inválido');

  await changeNumber(page, 'q', 12);
  await unsolved(page, 7);
  await expect(page.locator(resolve)).toBeEnabled();
  await page.locator(resolve).click();
  await finished(page);
});

test('invalid form input leaves only nodes, disables Resolve, and recovers without Generate', async ({ page }) => {
  await page.goto(route('en'));
  await page.locator(resolve).click();
  await expect(page.locator(results)).toContainText('44');
  await changeNumber(page, 'n', 13);
  await unsolved(page, 7);
  await expect(page.locator(resolve)).toBeDisabled();
  await expect(page.locator(status)).toContainText('Invalid parameters');
  await changeNumber(page, 'n', 5);
  await unsolved(page, 6);
  await expect(page.locator(resolve)).toBeEnabled();
  await page.locator(resolve).click();
  await finished(page);
});

test('loading blocks controls until the Worker finishes and permits cancellation', async ({ page }) => {
  await mockWorker(page, 600);
  await page.goto(route('en'));
  await page.locator(resolve).click();
  await expect(page.locator(overlay)).toBeVisible();
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'true');
  for (const name of Object.keys(inputs)) await expect(page.locator(inputs[name])).toBeDisabled();
  await expect(page.locator(json)).toBeDisabled();
  await expect(page.locator(resolve)).toBeDisabled();
  await expect(page.locator('[data-cvrp-cancel]')).toBeEnabled();

  await page.locator('[data-cvrp-cancel]').click();
  await expect(page.locator(overlay)).toBeHidden();
  await unsolved(page, 7);
  await expect(page.locator(status)).toContainText('Computation cancelled');

  await changeNumber(page, 'n', 7);
  await unsolved(page, 8);
  await page.locator(resolve).click();
  await expect(page.locator(overlay)).toBeVisible();
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator(results)).toContainText('123');
  await page.waitForTimeout(650);
  await expect(page.locator(results)).toContainText('123');
  expect(await page.evaluate(() => window.__cvrpWorkers.every(w => w.terminated))).toBe(true);
});

test('programmatic input events while loading do not mutate in-flight results', async ({ page }) => {
  await mockWorker(page, 300);
  await page.goto(route('en'));
  await page.locator(resolve).click();
  await expect(page.locator(overlay)).toBeVisible();
  await page.evaluate(() => {
    const el = document.querySelector('[data-cvrp-n]');
    el.value = '8';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator(results)).toContainText('123');
  const oldInstance = await page.locator(json).inputValue();
  expect(JSON.parse(oldInstance).demands).toHaveLength(6);
  // Once unlocked, input events refresh the instance and clear route edges.
  await page.locator(inputs.n).dispatchEvent('change');
  await unsolved(page, 9);
  await page.locator(resolve).click();
  await expect(page.locator(results)).toContainText('123');
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(2);
});

test('repeated explicit Resolve presses create new runs and do not leave stale solutions', async ({ page }) => {
  await mockWorker(page, 90);
  await page.goto(route('en'));
  for (let i = 0; i < 5; i++) {
    await page.locator(resolve).click();
    await expect(page.locator(results)).toContainText('123');
    await expect(page.locator(overlay)).toBeHidden();
    await expect(page.locator(root)).toHaveAttribute('aria-busy', 'false');
  }
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(5);
});


test('the CVRP controller is fingerprinted and immune to a stale static script', async ({ page }) => {
  const requested = [];
  await page.route('**/cvrp-simulator.js', route =>
    route.fulfill({ status: 200, contentType: 'application/javascript',
      body: 'throw new Error("stale static controller loaded")' }));
  page.on('request', request => requested.push(new URL(request.url()).pathname));
  await page.goto(route('en'));
  await expect(page.locator(resolve)).toBeEnabled();
  await page.locator(resolve).click();
  await expect(page.locator(results)).toContainText('44');
  await expect(page.locator(graph + ' line')).toHaveCount(9);
  expect(requested).not.toContain('/cvrp-simulator.js');
  expect(requested.some(path => path.startsWith('/_astro/') && path.endsWith('.js'))).toBe(true);
});

test('fast solve keeps the loading dialog visible for at least one second', async ({ page }) => {
  await mockWorker(page, 25);
  await page.goto(route('en'));
  const startedAt = await page.evaluate(() => {
    window.__cvrpStartedAt = performance.now();
    document.querySelector('[data-cvrp-run]').click();
    return window.__cvrpStartedAt;
  });
  await expect(page.locator(overlay)).toBeVisible();
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator(overlay)).toBeHidden({ timeout: 10000 });
  const elapsed = await page.evaluate(start => performance.now() - start, startedAt);
  expect(elapsed).toBeGreaterThanOrEqual(950);
  await expect(page.locator(results)).toContainText('123');
});

test('loading can be cancelled even after a fast Worker has replied', async ({ page }) => {
  await mockWorker(page, 20);
  await page.goto(route('en'));
  await page.locator(resolve).click();
  await expect(page.locator(overlay)).toBeVisible();
  await page.waitForTimeout(90);
  await expect(page.locator(overlay)).toBeVisible();
  await page.locator('[data-cvrp-cancel]').click();
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator(results)).toBeEmpty();
  await page.waitForTimeout(1100);
  await expect(page.locator(results)).toBeEmpty();
  await page.locator(resolve).click();
  await expect(page.locator(results)).toContainText('123');
});

test('the interface rejects unsupported input limits and constrains K to the customer count', async ({ page }) => {
  await page.goto(route('en'));
  for (const [field, min, max] of [
    ['n', '2', '12'], ['q', '1', '100000'], ['k', '1', '6'],
    ['l', '1', '100000'], ['seed', '0', '2147483647'],
  ]) {
    await expect(page.locator(inputs[field])).toHaveAttribute('min', min);
    await expect(page.locator(inputs[field])).toHaveAttribute('max', max);
  }

  await changeNumber(page, 'n', 2);
  await expect(page.locator(inputs.k)).toHaveAttribute('max', '2');
  await expect(page.locator(inputs.k)).toHaveValue('2');
  await unsolved(page, 3);
  await page.locator(resolve).click();
  await finished(page);

  await changeNumber(page, 'n', 13);
  await expect(page.locator(resolve)).toBeDisabled();
  await unsolved(page, 3);
  await changeNumber(page, 'n', 12);
  await expect(page.locator(resolve)).toBeEnabled();
  await unsolved(page, 13);

  await changeNumber(page, 'q', 100001);
  await expect(page.locator(resolve)).toBeDisabled();
  await changeNumber(page, 'q', 100000);
  await expect(page.locator(resolve)).toBeEnabled();
  await changeNumber(page, 'l', 100001);
  await expect(page.locator(resolve)).toBeDisabled();
  await changeNumber(page, 'l', 100000);
  await expect(page.locator(resolve)).toBeEnabled();
  await changeNumber(page, 'seed', 2147483648);
  await expect(page.locator(resolve)).toBeDisabled();
  await changeNumber(page, 'seed', 2147483647);
  await expect(page.locator(resolve)).toBeEnabled();
});

test('JSON manual inputs cannot bypass the browser range limits', async ({ page }) => {
  await page.goto(route('en'));
  const field = page.locator(json);
  const valid = JSON.parse(await field.inputValue());
  for (const [mutator, label] of [
    [input => { input.demands.push(1); }, 'invalid matrix dimensions'],
    [input => { input.vehicle_capacity = 100001; }, 'capacity overflow'],
    [input => { input.max_vehicles = 99; }, 'fleet overflow'],
    [input => { input.max_route_distance = 100001; }, 'route length overflow'],
    [input => { input.distances[0][1] = 100001; }, 'arc cost overflow'],
    [input => { input.demands[0] = 100001; }, 'demand overflow'],
  ]) {
    const changed = structuredClone(valid);
    mutator(changed);
    await field.fill(JSON.stringify(changed));
    await expect(page.locator(resolve), label).toBeDisabled();
    await expect(page.locator(graph + ' line')).toHaveCount(0);
    await field.fill(JSON.stringify(valid));
    await expect(page.locator(resolve)).toBeEnabled();
  }
});


test('REGRESSION: actual WASM must redraw edges after editing and resolving new feasible graphs', async ({ page }) => {
  await page.goto(route('en'));
  await page.locator(resolve).click();
  await expect(page.locator(results)).toContainText('44');
  await finished(page);
  for (const [name, value] of [
    ['n', 7], ['n', 8], ['n', 10], ['n', 12],
    ['seed', 42], ['q', 8], ['k', 4], ['l', 12],
    ['n', 6], ['seed', 7], ['l', 18],
  ]) {
    await changeNumber(page, name, value);
    const newInstance = JSON.parse(await page.locator(json).inputValue());
    await unsolved(page, newInstance.demands.length + 1);
    await page.locator(resolve).click();
    await finished(page);
    const edges = await page.locator(graph + ' line').count();
    const polylines = await page.locator(graph + ' polygon').count();
    const cards = await page.locator('.cvrp-route').count();
    expect(edges).toBeGreaterThanOrEqual(cards * 2);
    expect(polylines).toBe(edges);
    await expect(page.locator(graph + ' circle')).toHaveCount(newInstance.demands.length + 1);
    const resultNumbers = await page.locator('.cvrp-route').allTextContents();
    expect(resultNumbers.length).toBeGreaterThan(0);
    expect(resultNumbers.every(card => card.includes('Route '))).toBe(true);
  }
});

test('REGRESSION: knowingly impossible synthetic instances display visible infeasibility, not silent blank output', async ({ page }) => {
  await page.goto(route('en'));
  await page.locator(resolve).click();
  await finished(page);
  await changeNumber(page, 'n', 12);
  await changeNumber(page, 'q', 1);
  await changeNumber(page, 'k', 2);
  await unsolved(page, 13);
  await page.locator(resolve).click();
  await expect(page.locator(status)).toContainText('Infeasible instance');
  await expect(page.locator('.cvrp-infeasible')).toContainText('Increase Q or K');
  await expect(page.locator(graph + ' line')).toHaveCount(0);
  await expect(page.locator(graph + ' polygon')).toHaveCount(0);
  await expect(page.locator(overlay)).toBeHidden();
  await changeNumber(page, 'k', 12);
  await expect(page.locator('.cvrp-infeasible')).toHaveCount(0);
  await unsolved(page, 13);
  await page.locator(resolve).click();
  await finished(page);
});

test('REGRESSION: after invalid JSON or cancellation, corrected inputs still produce edges with real WASM', async ({ page }) => {
  await page.goto(route('pt'));
  await page.locator(resolve).click();
  await finished(page);
  await page.locator(json).fill('{ bad }');
  await expect(page.locator(resolve)).toBeDisabled();
  await expect(page.locator(graph + ' line')).toHaveCount(0);
  await changeNumber(page, 'seed', 123);
  await expect(page.locator(resolve)).toBeEnabled();
  await unsolved(page, 7);
  await page.locator(resolve).click();
  await finished(page);
  await changeNumber(page, 'n', 8);
  await unsolved(page, 9);
  await page.locator(resolve).click();
  await finished(page);
});
