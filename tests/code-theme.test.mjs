import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (name) => readFileSync(path.join(root, name), 'utf8');

test('syntax highlighting uses the dark blue GitHub theme for every article', () => {
  const config = read('astro.config.mjs');
  assert.match(config, /themes:\s*\['github-dark-dimmed'\]/);
  assert.match(config, /expressiveCode\(\{/);
  assert.match(config, /syntaxHighlight:\s*false/);
  assert.doesNotMatch(config, /gruvbox-dark-hard/);
  for (const [name, value] of [
    ['codeBackground', '#10151d'],
    ['codeForeground', '#e6edf6'],
    ['borderColor', '#435975'],
    ['focusBorder', '#8fc9ff'],
  ]) {
    assert.ok(config.includes(`${name}: '${value}'`), `Expected ${name} to match site palette`);
  }
});

test('code blocks and their frame UI use Fantasque Sans Mono', () => {
  const config = read('astro.config.mjs');
  assert.match(config, /codeFontFamily:\s*["']Fantasque Sans Mono/);
  assert.match(config, /uiFontFamily:\s*["']Fantasque Sans Mono/);
  const typography = read('src/styles/tokens/typography.css');
  assert.match(typography, /font-variant-ligatures: common-ligatures contextual/);
});

test('the original PT and EN articles still contain fenced code snippets', () => {
  for (const locale of ['pt', 'en']) {
    const directory = path.join(root, 'src/content/articles', locale);
    const articles = readdirSync(directory).filter(name => /\.mdx?$/.test(name));
    assert.ok(articles.length > 0);
    assert.ok(articles.some(name =>
      /```(?:rust|c|bash|javascript|typescript|sh)\b/.test(
        read(`src/content/articles/${locale}/${name}`)
      )
    ), `Missing syntax-highlightable code in ${locale} articles`);
  }
});
