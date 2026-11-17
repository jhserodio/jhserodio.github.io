import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=relative=>readFileSync(path.join(root,relative),'utf8');

test('the 2019 JS monogram favicon is restored instead of the interim J icon', () => {
  const favicon=read('public/favicon.svg');
  assert.ok(favicon.includes('#5f83b3'));
  assert.ok(favicon.includes('aria-label="J"') || favicon.includes('<title>favicon</title>'));
  assert.ok(!favicon.includes('fill="#fff">J</text>'));
  for (const file of [
    'favicon.svg','favicon.ico','favicon-16x16.png','favicon-32x32.png',
    'apple-touch-icon.png','android-chrome-192x192.png',
    'android-chrome-512x512.png','site.webmanifest'
  ]) assert.ok(existsSync(path.join(root,'public',file)),file);
});

test('all locale pages load the original favicon family with cache-busting URLs',()=>{
  const layout=read('src/layouts/BaseLayout.astro');
  for (const name of ['favicon.svg','favicon.ico','favicon-16x16.png','favicon-32x32.png','apple-touch-icon.png','site.webmanifest']) {
    assert.ok(layout.includes('/'+name+'?v=js-original'),name);
  }
  assert.ok(layout.includes('name="theme-color"'));
  const manifest=JSON.parse(read('public/site.webmanifest'));
  assert.equal(manifest.theme_color,'#10151d');
  assert.ok(manifest.icons.some(icon=>icon.src==='/android-chrome-192x192.png'));
});
