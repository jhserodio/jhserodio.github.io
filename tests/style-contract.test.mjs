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
  assert.match(css, /background-size: 10px 10px/);
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

test('edited portrait replaces the header image without deleting the original', () => {
  assert.ok(existsSync(path.join(root, 'public/profile.jpg')));
  assert.ok(existsSync(path.join(root, 'public/profile-portrait.webp')));
  assert.match(read('src/layouts/BaseLayout.astro'), /class="site-shell"/);
  assert.match(read('src/components/Header.astro'), /src="\/profile-portrait.webp"/);
});
test('master-like background and header reproduce the original restrained 3% and 1% grids', () => {
  const tokens = read('src/styles/tokens/colors.css');
  const css = read('src/styles/main.css');
  assert.match(tokens, /--grid-line-soft: rgba\(255, 255, 255, \.03\)/);
  assert.match(tokens, /--grid-line: rgba\(255, 255, 255, \.01\)/);
  assert.match(tokens, /--grid-background:/);
  assert.match(tokens, /--grid-glass:/);
  assert.match(css, /background-image: var\(--grid-background\)/);
  const shell = css.match(/\.site-shell\s*\{([^}]*)\}/)?.[1];
  assert.ok(shell);
  assert.match(shell, /background-color: var\(--glass-surface\)/);
  assert.match(shell, /background-image: var\(--shine\)/);
  assert.doesNotMatch(shell, /var\(--grid-glass\)/);
  assert.match(shell, /backdrop-filter: blur\(1px\)/);
  const banner = css.match(/\.site-banner\s*\{([^}]*)\}/)?.[1];
  assert.match(banner ?? '', /background-image: var\(--grid-glass\)/);
  assert.match(css, /background-size: 10px 10px/);
});

test('edited portrait is circular on desktop and mobile', () => {
  const css = read('src/styles/main.css');
  const photo = css.match(/\.profile-photo\s*\{([^}]*)\}/)?.[1];
  const img = css.match(/\.profile-photo img\s*\{([^}]*)\}/)?.[1];
  assert.match(photo ?? '', /border-radius:\s*50%/);
  assert.match(img ?? '', /border-radius:\s*50%/);
  assert.match(photo ?? '', /overflow:\s*hidden/);
  assert.match(css, /\.profile-photo\s*\{ flex-basis: 7\.25rem/);
  assert.match(read('src/components/Header.astro'), /src="\/profile-portrait\.webp"/);
  assert.ok(existsSync(path.join(root, 'public/profile-portrait.webp')));
});
