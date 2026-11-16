import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (name) => readFileSync(path.join(root, name), 'utf8');

test('reuses the original dark palette and the grid / radial background', () => {
  const colors = read('src/styles/tokens/colors.css');
  const css = read('src/styles/main.css');
  for (const hex of ['#1d242e', '#10151d', '#435975', '#8fc9ff']) {
    assert.ok(colors.includes(hex), 'Missing original color: ' + hex);
  }
  assert.match(css, /radial-gradient|--shine/);
  assert.match(css, /background-size: 12px 12px/);
});

test('Fantasque Sans Mono v1.8 provides four webfont faces with ligatures enabled', () => {
  const css = read('src/styles/tokens/typography.css');
  assert.equal((css.match(/@font-face/g) ?? []).length, 4);
  assert.ok((css.match(/FantasqueSansMono-\w+\.woff2/g) ?? []).length >= 4);
  assert.match(css, /font-variant-ligatures: common-ligatures contextual/);
  assert.match(css, /"liga" 1, "calt" 1/);
  assert.ok(!/JetBrains|Fira Code|Roboto Mono|Consolas/.test(css));
});

test('skill bars use original progress levels and accessible meters', () => {
  const bars = read('src/components/SkillBars.astro');
  const page = read('src/templates/ResumePage.astro');
  assert.match(page, /<SkillBars lang={lang}/);
  assert.match(bars, /role="meter"/);
  assert.match(bars, /aria-valuenow={skill.level}/);
  assert.match(bars, /resumePt/);
  assert.match(bars, /resumeEn/);
});

test('original profile image is preserved locally, and site shell includes every page', () => {
  assert.ok(existsSync(path.join(root, 'public/profile.jpg')));
  assert.match(read('src/layouts/BaseLayout.astro'), /class="site-shell"/);
  assert.match(read('src/components/Header.astro'), /src="\/profile.jpg"/);
});
