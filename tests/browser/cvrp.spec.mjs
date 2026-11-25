import { test, expect } from '@playwright/test';

const route = lang => '/' + lang + '/apps/cvrp-solver/';
const formSelectors = {
  n: '[data-cvrp-n]', q: '[data-cvrp-q]', k: '[data-cvrp-k]',
  l: '[data-cvrp-l]', seed: '[data-cvrp-seed]',
};
const root = '[data-cvrp-root]';
const overlay = '[data-cvrp-overlay]';
const status = '[data-cvrp-status]';
const graph = '[data-cvrp-graph]';
const results = '[data-cvrp-results]';

async function editedNumber(page, name, value) {
  const field = page.locator(formSelectors[name]);
  await field.fill(String(value));
  await field.press('Tab');
}

async function finished(page) {
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator('[data-cvrp-run]')).toBeEnabled();
  await expect(page.locator(status)).toContainText(
    /Optimal solution|No feasible solution|Solução ótima|Não existe solução viável/,
  );
}

// Mock only for deterministic lifecycle/UI tests. Real WASM runs separately.
async function mockSlowWorker(page, ms = 500) {
  await page.addInitScript(delay => {
    window.__cvrpWorkers = [];
    window.Worker = class FakeWorker {
      constructor() {
        this.terminated = false;
        window.__cvrpWorkers.push(this);
      }
      postMessage(message) {
        this.payload = message;
        // Save callback before cancellation to simulate a late message from a worker.
        const callback = this.onmessage;
        setTimeout(() => callback?.({ data: {
          id: message.id,
          result: {
            status: 'optimal',
            total_distance: '123',
            routes: [{ stops: [0, 1, 0], demand: message.instance.demands[0], distance: 2 }],
          },
        } }), delay);
      }
      terminate() { this.terminated = true; }
    };
  }, ms);
}

test('English and Portuguese pages include editable defaults and fixed Back to Apps link', async ({ page }) => {
  for (const lang of ['en', 'pt']) {
    await page.goto(route(lang));
    await expect(page.locator('[data-cvrp-root]')).toBeVisible();
    await expect(page.locator('.cvrp-back')).toHaveAttribute('href', 'https://serodio.dev/en/apps/');
    await expect(page.locator(formSelectors.n)).toHaveValue('6');
    await expect(page.locator(formSelectors.q)).toHaveValue('7');
    await expect(page.locator(formSelectors.k)).toHaveValue('3');
    await expect(page.locator(formSelectors.l)).toHaveValue('18');
    const instance = JSON.parse(await page.locator('[data-cvrp-json]').inputValue());
    expect(instance.demands).toHaveLength(6);
    await expect(page.locator(overlay)).toBeHidden();
    await expect(page.locator(root)).toHaveAttribute('aria-busy', 'false');
  }
});

test('actual compiled WASM solves fixture and redraws its nine arcs', async ({ page }) => {
  await page.goto(route('en'));
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(status)).toContainText('Optimal solution found by Rust');
  await expect(page.locator(results)).toContainText('44');
  await expect(page.locator('.cvrp-route')).toHaveCount(3);
  await expect(page.locator(graph + ' line')).toHaveCount(9);
  await expect(page.locator(graph + ' polygon')).toHaveCount(9);
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('[data-cvrp-run]')).toBeEnabled();
});

test('actual WASM only regenerates and resolves after explicit clicks, across all controls', async ({ page }) => {
  await page.goto(route('en'));
  await page.locator('[data-cvrp-run]').click();
  await finished(page);

  for (const [name, value] of [
    ['l', 45], ['q', 12], ['n', 7], ['seed', 17],
    ['k', 5], ['n', 5], ['q', 8], ['k', 3],
    ['l', 50], ['seed', 99], ['n', 6], ['q', 7],
  ]) {
    const previousJSON = await page.locator('[data-cvrp-json]').inputValue();
    const previousResult = await page.locator(results).innerHTML();
    const previousGraph = await page.locator(graph).innerHTML();
    const previousStatus = await page.locator(status).textContent();

    await editedNumber(page, name, value);
    // Editing parameters must not mutate the result, JSON, status or graph.
    await expect(page.locator('[data-cvrp-json]')).toHaveValue(previousJSON);
    expect(await page.locator(results).innerHTML()).toBe(previousResult);
    expect(await page.locator(graph).innerHTML()).toBe(previousGraph);
    await expect(page.locator(status)).toHaveText(previousStatus);
    await expect(page.locator('[data-cvrp-pending]')).toBeVisible();
    await expect(page.locator('[data-cvrp-run]')).toBeDisabled();
    await expect(page.locator(overlay)).toBeHidden();

    await page.locator('[data-cvrp-generate]').click();
    await expect(page.locator('[data-cvrp-pending]')).toBeHidden();
    await expect(page.locator(results)).toBeEmpty();
    await expect(page.locator(graph + ' line')).toHaveCount(0);
    await expect(page.locator(overlay)).toBeHidden();
    await expect(page.locator('[data-cvrp-run]')).toBeEnabled();

    const newInstance = JSON.parse(await page.locator('[data-cvrp-json]').inputValue());
    if (name === 'n') expect(newInstance.demands.length).toBe(value);
    if (name === 'q') expect(newInstance.vehicle_capacity).toBe(value);
    if (name === 'k') expect(newInstance.max_vehicles).toBe(value);
    if (name === 'l') expect(newInstance.max_route_distance).toBe(value);
    await expect(page.locator(graph + ' circle')).toHaveCount(newInstance.demands.length + 1);

    await page.locator('[data-cvrp-run]').click();
    await finished(page);
  }
  await page.locator('[data-cvrp-run]').click();
  await finished(page);
});
test('Generate clears solution without solving; manual JSON, errors and recovery work', async ({ page }) => {
  await page.goto(route('pt'));
  await page.locator('[data-cvrp-run]').click();
  await finished(page);
  await expect(page.locator(results)).toContainText('44');

  await page.locator('[data-cvrp-generate]').click();
  await expect(page.locator(results)).toBeEmpty();
  await expect(page.locator(graph + ' line')).toHaveCount(0);
  await expect(page.locator(status)).toContainText('Instância gerada');
  await expect(page.locator(overlay)).toBeHidden();

  const textarea = page.locator('[data-cvrp-json]');
  const changed = JSON.parse(await textarea.inputValue());
  changed.vehicle_capacity = 1;
  await textarea.fill(JSON.stringify(changed));
  await expect(page.locator('[data-cvrp-pending]')).toBeVisible();
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(status)).toContainText('Não existe solução viável');
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'false');

  await textarea.fill('{ broken json }');
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(status)).toContainText('Entrada inválida');
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'false');

  await editedNumber(page, 'q', 12);
  await expect(page.locator('[data-cvrp-run]')).toBeDisabled();
  await page.locator('[data-cvrp-generate]').click();
  await expect(page.locator(status)).toContainText('Instância gerada');
  await expect(page.locator(results)).toBeEmpty();
  await page.locator('[data-cvrp-run]').click();
  await finished(page);
});
test('loading blocks input; cancelling requires Generate and Solve for a new instance', async ({ page }) => {
  await mockSlowWorker(page, 450);
  await page.goto(route('en'));
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(overlay)).toBeVisible();
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'true');
  for (const name of Object.keys(formSelectors)) {
    await expect(page.locator(formSelectors[name])).toBeDisabled();
  }
  await expect(page.locator('[data-cvrp-json]')).toBeDisabled();
  await expect(page.locator('[data-cvrp-run]')).toBeDisabled();
  await expect(page.locator('[data-cvrp-generate]')).toBeDisabled();

  await page.locator('[data-cvrp-cancel]').click();
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator(status)).toContainText('Computation cancelled');
  await expect(page.locator(results)).toBeEmpty();

  const workersBefore = await page.evaluate(() => window.__cvrpWorkers.length);
  await editedNumber(page, 'n', 7);
  await expect(page.locator('[data-cvrp-run]')).toBeDisabled();
  await expect(page.locator(overlay)).toBeHidden();
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(workersBefore);

  await page.locator('[data-cvrp-generate]').click();
  await expect(page.locator(results)).toBeEmpty();
  await expect(page.locator(overlay)).toBeHidden();
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(workersBefore);

  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(overlay)).toBeVisible();
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator(results)).toContainText('123');
  await page.waitForTimeout(550);
  expect(await page.locator('.cvrp-route').count()).toBe(1);
  expect(await page.evaluate(() => window.__cvrpWorkers.every(w => w.terminated))).toBe(true);
});
test('cross-ordered edits never spawn a worker until Solve and preserve old results', async ({ page }) => {
  await mockSlowWorker(page, 170);
  await page.goto(route('en'));
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(overlay)).toBeVisible();
  await page.locator('[data-cvrp-cancel]').click();
  await expect(page.locator(results)).toBeEmpty();

  for (const [name, value] of [
    ['n', 4], ['seed', 4], ['q', 8], ['k', 4], ['l', 60],
    ['n', 6], ['q', 15], ['seed', 7], ['k', 3], ['l', 90],
  ]) {
    const countBefore = await page.evaluate(() => window.__cvrpWorkers.length);
    const oldResults = await page.locator(results).innerHTML();
    const oldJSON = await page.locator('[data-cvrp-json]').inputValue();
    await editedNumber(page, name, value);
    expect(await page.locator(results).innerHTML()).toBe(oldResults);
    await expect(page.locator('[data-cvrp-json]')).toHaveValue(oldJSON);
    await expect(page.locator(overlay)).toBeHidden();
    expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(countBefore);

    await page.locator('[data-cvrp-generate]').click();
    await expect(page.locator(results)).toBeEmpty();
    expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(countBefore);

    await page.locator('[data-cvrp-run]').click();
    await expect(page.locator(overlay)).toBeVisible();
    await expect(page.locator(overlay)).toBeHidden();
    await expect(page.locator(results)).toContainText('123');
    expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(countBefore + 1);
  }

  await page.locator('[data-cvrp-generate]').click();
  await expect(page.locator(results)).toBeEmpty();
  await expect(page.locator(overlay)).toBeHidden();
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(overlay)).toBeVisible();
  await expect(page.locator(overlay)).toBeHidden();
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(12);
});
test('programmatic parameter events during loading do not cancel the current run', async ({ page }) => {
  await mockSlowWorker(page, 400);
  await page.goto(route('en'));
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(overlay)).toBeVisible();

  await page.evaluate(() => {
    const el = document.querySelector('[data-cvrp-n]');
    el.value = '8';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator('[data-cvrp-json]')).toHaveJSProperty('disabled', true);
  await expect(page.locator(overlay)).toBeHidden();
  expect(JSON.parse(await page.locator('[data-cvrp-json]').inputValue()).demands).toHaveLength(6);
  await expect(page.locator(results)).toContainText('123');
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(1);

  await page.locator('[data-cvrp-generate]').click();
  await expect(page.locator(results)).toBeEmpty();
  expect(JSON.parse(await page.locator('[data-cvrp-json]').inputValue()).demands).toHaveLength(8);
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(1);
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator(results)).toContainText('123');
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(2);
});
test('invalid staged parameters preserve result until Generate, then recover', async ({ page }) => {
  await page.goto(route('en'));
  await page.locator('[data-cvrp-run]').click();
  await finished(page);
  await expect(page.locator(results)).toContainText('44');
  const previousJSON = await page.locator('[data-cvrp-json]').inputValue();
  const previousGraph = await page.locator(graph).innerHTML();

  await editedNumber(page, 'n', 13);
  await expect(page.locator(results)).toContainText('44');
  await expect(page.locator('[data-cvrp-json]')).toHaveValue(previousJSON);
  expect(await page.locator(graph).innerHTML()).toBe(previousGraph);
  await expect(page.locator('[data-cvrp-run]')).toBeDisabled();

  await page.locator('[data-cvrp-generate]').click();
  await expect(page.locator(status)).toContainText('Invalid parameters');
  await expect(page.locator(results)).toBeEmpty();
  await expect(page.locator('[data-cvrp-json]')).toHaveValue('');
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('[data-cvrp-run]')).toBeDisabled();

  await editedNumber(page, 'n', 5);
  await page.locator('[data-cvrp-generate]').click();
  await expect(page.locator('[data-cvrp-run]')).toBeEnabled();
  await expect(page.locator(results)).toBeEmpty();
  await page.locator('[data-cvrp-run]').click();
  await finished(page);
});

test('changing several parameters before Generate never changes the previous solution', async ({ page }) => {
  await mockSlowWorker(page, 80);
  await page.goto(route('en'));
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(results)).toContainText('123');

  const jsonBefore = await page.locator('[data-cvrp-json]').inputValue();
  const resultBefore = await page.locator(results).innerHTML();
  const graphBefore = await page.locator(graph).innerHTML();
  const statusBefore = await page.locator(status).textContent();

  for (const [key, value] of [
    ['q', 17], ['n', 10], ['l', 75], ['seed', 42], ['k', 5],
    ['n', 8], ['q', 9], ['l', 90],
  ]) {
    await editedNumber(page, key, value);
    await expect(page.locator('[data-cvrp-json]')).toHaveValue(jsonBefore);
    expect(await page.locator(results).innerHTML()).toBe(resultBefore);
    expect(await page.locator(graph).innerHTML()).toBe(graphBefore);
    await expect(page.locator(status)).toHaveText(statusBefore);
    await expect(page.locator(overlay)).toBeHidden();
  }
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(1);
  await page.locator('[data-cvrp-generate]').click();
  await expect(page.locator(results)).toBeEmpty();
  await expect(page.locator(graph + ' line')).toHaveCount(0);
  await expect(page.locator('[data-cvrp-json]')).not.toHaveValue(jsonBefore);
  expect(JSON.parse(await page.locator('[data-cvrp-json]').inputValue()).demands).toHaveLength(8);
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(1);
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(results)).toContainText('123');
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(2);
});

test('editing JSON manually preserves current results until explicit Solve', async ({ page }) => {
  await mockSlowWorker(page, 70);
  await page.goto(route('pt'));
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(results)).toContainText('123');
  const graphBefore = await page.locator(graph).innerHTML();

  const textarea = page.locator('[data-cvrp-json]');
  const json = JSON.parse(await textarea.inputValue());
  json.vehicle_capacity = 11;
  await textarea.fill(JSON.stringify(json));
  await expect(page.locator(results)).toContainText('123');
  expect(await page.locator(graph).innerHTML()).toBe(graphBefore);
  await expect(page.locator('[data-cvrp-pending]')).toContainText('JSON editado');
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(1);
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator('[data-cvrp-pending]')).toBeHidden();
  await expect(page.locator(results)).toContainText('123');
  const lastInput = await page.evaluate(() => window.__cvrpWorkers.at(-1).payload.instance);
  expect(lastInput.vehicle_capacity).toBe(11);
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBe(2);
});
