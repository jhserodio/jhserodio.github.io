import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import matter from 'gray-matter';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (name) => readFileSync(path.join(root, name), 'utf8');

test('real translated articles include mathematics and highlighted code', () => {
  const pt = matter(read('src/content/articles/pt/matematica-com-rust-modulo-1.md'));
  const en = matter(read('src/content/articles/en/math-with-rust-module-1.md'));
  assert.equal(pt.data.lang, 'pt');
  assert.equal(en.data.lang, 'en');
  assert.ok(pt.data.publish && en.data.publish);
  assert.equal(pt.data.translationKey, en.data.translationKey);
  for (const { content, data } of [pt, en]) {
    assert.equal(data.cover, '/article-images/math-with-rust-module-1.jpg');
    assert.ok(existsSync(path.join(root, 'public', data.cover.slice(1))), 'Published cover file is missing');
    assert.ok(content.includes('$$'), 'Missing mathematical display notation');
    assert.ok(content.includes('```rust'), 'Missing Rust source code snippets');
    assert.equal(content.includes('/math-with-rust-mod1-cover.svg'), false, 'Obsolete placeholder figure remains');
  }
  for (const removed of [
    'src/content/articles/pt/boas-vindas.md',
    'src/content/articles/en/welcome.md',
    'public/article-diagram.svg',
  ]) {
    assert.ok(!existsSync(path.join(root, removed)), 'Obsolete sample remains: ' + removed);
  }
});

test('detail routes are explicit and never use a catch-all', () => {
  for (const lang of ['pt', 'en']) {
    for (const type of ['articles', 'apps']) {
      const dir = `src/pages/${lang}/${type}`;
      assert.ok(existsSync(path.join(root, dir, '[slug].astro')));
      assert.ok(existsSync(path.join(root, dir, 'index.astro')));
      assert.ok(!existsSync(path.join(root, dir, '[...slug].astro')));
      assert.match(read(`${dir}/[slug].astro`), /getStaticPaths/);
    }
  }
});

test('resume keeps original translated career entries and projects', () => {
  for (const lang of ['pt', 'en']) {
    const data = read(`src/i18n/resume/${lang}.ts`);
    for (const key of ['boticario', 'vnator', 'nzn', 'pagarme', 'kovi', 'pedePronto', 'agrotis', 'polvo', 'freelance']) {
      assert.match(data, new RegExp(key + ':'));
    }
  }
  const adapter = read('src/i18n/resume-data.ts');
  assert.match(adapter, /Quantitative Developer Roadmap/);
  assert.match(adapter, /ResumeSchema\.parse/);
});

test('CVRP WASM app is active and backed by Rust in both languages', () => {
  for (const lang of ['pt', 'en']) {
    const app = JSON.parse(read('src/content/apps/' + lang + '/cvrp-solver.json'));
    assert.equal(app.status, 'active');
    assert.equal(app.type, 'wasm-interactive');
    assert.equal(app.wasmModule, 'cvrp-solver');
  }
  assert.ok(existsSync(path.join(root, 'crates/cvrp-solver-wasm/Cargo.toml')));
  assert.ok(existsSync(path.join(root, 'crates/cvrp-solver-wasm/src/lib.rs')));
  assert.match(read('src/templates/AppDetailPage.astro'), /CvrpSimulator/);
  assert.match(read('src/components/CvrpSimulator.astro'), /https:\/\/serodio\.dev\/en\/apps\//);
  assert.match(read('src/components/CvrpSimulator.astro'), /import '\.\.\/client\/cvrp-simulator\.js'/);
  assert.doesNotMatch(read('src/components/CvrpSimulator.astro'), /src="\/cvrp-simulator\.js"/);
  assert.ok(existsSync(path.join(root, 'src/client/cvrp-simulator.js')));
  assert.match(read('public/cvrp-worker.js'), /cvrp_solver_wasm/);
});

test('canonical domain matches original Pages configuration', () => {
  assert.match(read('astro.config.mjs'), /https:\/\/serodio\.dev/);
  assert.equal(read('public/CNAME').trim(), 'serodio.dev');
});

test('footer uses the requested professional identity without Astro branding', () => {
  const footer = read('src/components/Footer.astro');
  const ui = read('src/i18n/ui.ts');
  assert.match(footer, /jhserodio · \{t\(lang\)\.footer\}/);
  assert.equal((ui.match(/Software Developer, Architect, Tech Leader and Mathematician/g) ?? []).length, 2);
  assert.doesNotMatch(ui, /Base Astro|Astro base/);
});
