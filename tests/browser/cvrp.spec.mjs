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

test('actual WASM resolves repeatedly after successive changes in all five controls', async ({ page }) => {
  await page.goto(route('en'));
  await page.locator('[data-cvrp-run]').click();
  await finished(page);
  // Cross several dimensions in a deliberately nontrivial order.
  for (const [name, value] of [
    ['l', 45], ['q', 12], ['n', 7], ['seed', 17],
    ['k', 5], ['n', 5], ['q', 8], ['k', 3],
    ['l', 50], ['seed', 99], ['n', 6], ['q', 7],
  ]) {
    await editedNumber(page, name, value);
    const input = JSON.parse(await page.locator('[data-cvrp-json]').inputValue());
    if (name === 'n') expect(input.demands.length).toBe(value);
    if (name === 'q') expect(input.vehicle_capacity).toBe(value);
    if (name === 'k') expect(input.max_vehicles).toBe(value);
    if (name === 'l') expect(input.max_route_distance).toBe(value);
    await finished(page);
    const expectedNodes = input.demands.length + 1;
    await expect(page.locator(graph + ' circle')).toHaveCount(expectedNodes);
  }
  // Same parameters can always be submitted again.
  await page.locator('[data-cvrp-run]').click();
  await finished(page);
});

test('generation, manual JSON edits, invalid data, infeasibility and recovery', async ({ page }) => {
  await page.goto(route('pt'));
  await page.locator('[data-cvrp-run]').click();
  await finished(page);
  await page.locator('[data-cvrp-generate]').click();
  await finished(page);
  const textarea = page.locator('[data-cvrp-json]');
  const changed = JSON.parse(await textarea.inputValue());
  changed.vehicle_capacity = 1;
  await textarea.fill(JSON.stringify(changed));
  await expect(page.locator(results)).toBeEmpty();
  await expect(page.locator(graph + ' line')).toHaveCount(0);
  await expect(page.locator(status)).toContainText('JSON modificado');
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(status)).toContainText('Não existe solução viável');
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'false');
  await textarea.fill('{ broken json }');
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(status)).toContainText('Entrada inválida');
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'false');
  await editedNumber(page, 'q', 12);
  await finished(page);
});

test('loading overlay blocks inputs, permits cancellation, and ignores stale worker replies', async ({ page }) => {
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
  await editedNumber(page, 'n', 7);
  await expect(page.locator(overlay)).toBeVisible();
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.locator(results)).toContainText('123');
  const count = await page.locator('.cvrp-route').count();
  expect(count).toBe(1);
  // A cancelled worker's saved callback cannot overwrite a newer result.
  await page.waitForTimeout(550);
  await expect(page.locator(results)).toContainText('123');
  expect(await page.locator('.cvrp-route').count()).toBe(count);
  expect(await page.evaluate(() => window.__cvrpWorkers.every(w => w.terminated))).toBe(true);
});

test('cross-ordered generate/edit/cancel/resolve cycles never leave a stale result', async ({ page }) => {
  await mockSlowWorker(page, 170);
  await page.goto(route('en'));
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(overlay)).toBeVisible();
  await page.locator('[data-cvrp-cancel]').click();
  // First cancelled run establishes automatic re-run after parameter changes.
  for (const [name, value] of [
    ['n', 4], ['seed', 4], ['q', 8], ['k', 4], ['l', 60],
    ['n', 6], ['q', 15], ['seed', 7], ['k', 3], ['l', 90],
  ]) {
    await editedNumber(page, name, value);
    await expect(page.locator(overlay)).toBeVisible();
    await expect(page.locator(overlay)).toBeHidden();
    await expect(page.locator(results)).toContainText('123');
    await expect(page.locator('[data-cvrp-run]')).toBeEnabled();
  }
  await page.locator('[data-cvrp-generate]').click();
  await expect(page.locator(overlay)).toBeVisible();
  await expect(page.locator(overlay)).toBeHidden();
  await page.locator('[data-cvrp-run]').click();
  await expect(page.locator(overlay)).toBeVisible();
  await expect(page.locator(overlay)).toBeHidden();
  expect(await page.evaluate(() => window.__cvrpWorkers.length)).toBeGreaterThanOrEqual(12);
});

test('parameter events arriving during busy computation invalidate and replace old work', async ({ page }) => {
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
  await expect(page.locator(overlay)).toBeHidden({ timeout: 15000 });
  expect(JSON.parse(await page.locator('[data-cvrp-json]').inputValue()).demands).toHaveLength(8);
  await expect(page.locator(results)).toContainText('123');
  await page.waitForTimeout(420);
  expect(await page.locator('.cvrp-route').count()).toBe(1);
});

test('invalid parameter changes recover without keeping stale JSON or locks', async ({ page }) => {
  await page.goto(route('en'));
  await page.locator('[data-cvrp-run]').click();
  await finished(page);
  await editedNumber(page, 'n', 13);
  await expect(page.locator(status)).toContainText('Invalid parameters');
  await expect(page.locator('[data-cvrp-json]')).toHaveValue('');
  await expect(page.locator(root)).toHaveAttribute('aria-busy', 'false');
  await editedNumber(page, 'n', 5);
  await finished(page);
});
