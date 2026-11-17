import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFileSync(path.join(root, name), 'utf8');

test('root HTML has static crawler-ready Open Graph metadata', () => {
  const entry = read('src/pages/index.astro');
  for (const key of ['property="og:title"', 'property="og:description"', 'property="og:image"',
    'property="og:url"', 'property="og:image:width"', 'property="og:image:height"',
    'name="twitter:card"', 'rel="canonical"', 'share.en.title']) {
    assert.ok(entry.includes(key), key);
  }
  assert.ok(entry.includes("window.location.replace('/' + locale + '/resume/'"));
  assert.ok(!entry.includes('Language / Idioma'));
});

test('the localized pages use Open Graph and an absolute JPEG preview', () => {
  const layout = read('src/layouts/BaseLayout.astro');
  for (const key of ['property="og:image"', 'property="og:description"', 'property="og:title"',
    'property="og:url"', 'name="twitter:card"', 'share[lang].title']) {
    assert.ok(layout.includes(key), key);
  }
  for (const locale of ['pt','en']) {
    const page = read('src/pages/' + locale + '/index.astro');
    assert.ok(page.includes('property="og:image"'), locale);
    assert.ok(page.includes('property="og:title"'), locale);
    assert.ok(page.includes('/' + locale + '/resume/'), locale);
  }
  const social = read('src/i18n/social.ts');
  assert.ok(social.includes("image: '/social-preview.jpg'"));
  assert.ok(social.includes('width: 1200'));
  assert.ok(social.includes('height: 630'));
  assert.ok(existsSync(path.join(root, 'scripts/generate-social-preview.mjs')));
  assert.ok(existsSync(path.join(root, 'scripts/check-social-preview.mjs')));
});
