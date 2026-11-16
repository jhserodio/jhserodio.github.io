import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = relative => readFileSync(path.join(root, relative), 'utf8');

test('articles page exposes accessible locale-aware tag filtering and clear action', () => {
  const page = read('src/templates/ArticlesIndexPage.astro');
  const filter = read('src/components/ArticlesDiscovery.astro');
  assert.match(page, /<ArticlesDiscovery lang=\{lang\} articles=\{articles\}/);
  for (const token of [
    'data-article-filters', 'data-filter-tag', 'data-clear-filters',
    'data-article-item', 'data-tags', 'aria-pressed="false"',
    'aria-controls="filtered-articles"', 'role="status"',
    'params.getAll(\'tag\')', 'url.searchParams.append(\'tag\', tag)',
    'selected.clear()', 'window.addEventListener(\'popstate\'',
    'node.hidden = !matches',
    'Nenhum artigo corresponde', 'No articles match',
  ]) assert.ok(filter.includes(token), 'Missing feature: '+token);
  assert.match(filter, /\.filter-item\[hidden\]/);
  assert.match(filter, /\[aria-pressed="true"\]/);
  assert.match(filter, /new Set\(article\.data\.tags\)/);
});

test('math-with-rust tag is present on roadmap, module 1 and module 2 only', () => {
  for (const lang of ['pt', 'en']) {
    const files = readdirSync(path.join(root,'src/content/articles',lang)).filter(name => /\.mdx?$/.test(name));
    const selected = files.map(name => matter(read(`src/content/articles/${lang}/${name}`)))
      .filter(article => article.data.publish && article.data.tags.includes('math-with-rust'));
    assert.equal(selected.length,3,lang);
    assert.deepEqual(selected.map(a => a.data.translationKey).sort(), [
      'math-with-rust-roadmap-series',
      'math-with-rust-module-1-algebraic-foundations',
      'math-with-rust-module-2-array-optimization'
    ].sort());
  }
});

test('the roadmap in each locale links to both localized module articles', () => {
  for (const [lang,roadmap,mod1,mod2] of [
    ['en','math-with-rust-roamap-series.md','math-with-rust-module-1','math-with-rust-module-2'],
    ['pt','matematica-com-rust-roadmap.md','matematica-com-rust-modulo-1','matematica-com-rust-modulo-2'],
  ]) {
    const markdown = read(`src/content/articles/${lang}/${roadmap}`);
    for (const slug of [mod1,mod2]) {
      assert.ok(markdown.includes(`/${lang}/articles/${slug}/`), 'Roadmap missing link to '+slug);
      assert.ok(readdirSync(path.join(root,'src/content/articles',lang)).includes(slug+'.md'), 'Missing target: '+slug);
    }
  }
});
