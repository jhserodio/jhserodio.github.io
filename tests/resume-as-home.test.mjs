import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFileSync(path.join(root, file), 'utf8');

test('home is replaced by locale-aware direct résumé routing', () => {
  const home = read('src/pages/index.astro');
  assert.ok(home.includes("window.location.replace('/' + locale + '/resume/'"));
  assert.ok(home.includes("localStorage.getItem(key)"));
  assert.ok(home.includes("navigator.languages"));
  assert.ok(home.includes('href="/pt/resume/"'));
  assert.ok(home.includes('href="/en/resume/"'));
  for (const lang of ['pt','en']) {
    const page = read(`src/pages/${lang}/index.astro`);
    assert.ok(page.includes(`url=/${lang}/resume/`));
    assert.ok(page.includes('window.location.replace('));
    assert.ok(page.includes('window.location.search + window.location.hash'));
    assert.doesNotMatch(page, /HomePage/);
  }
  assert.equal(existsSync(path.join(root, 'src/templates/HomePage.astro')), false);
});

test('site header navigates directly to résumé with no obsolete Home tab', () => {
  const header = read('src/components/Header.astro');
  assert.ok(header.includes("href={localePath(lang, 'resume')}"));
  assert.ok(!header.includes('label: u.nav.home'));
  const notFound = read('src/pages/404.astro');
  assert.ok(notFound.includes("href={localePath(lang, 'resume')}"));
  assert.ok(notFound.includes('switchUrl="/en/resume/"'));
});

test('résumé header features LinkedIn, email, GitHub and LeetCode links', () => {
  const page = read('src/templates/ResumePage.astro');
  const css = read('src/styles/resume.css');
  const constants = read('src/helpers/constants.ts');
  assert.ok(page.includes('class="resume-quick-links"'));
  for (const label of ['LinkedIn', 'Email', 'GitHub', 'LeetCode']) {
    assert.ok(page.includes(`label: '${label}'`), label);
  }
  assert.ok(page.includes('mailto:'));
  assert.ok(page.includes('me.contact.github.value'));
  assert.ok(page.includes('me.contact.linkedin.value'));
  assert.ok(page.includes('me.contact.leetcode.value'));
  assert.ok(constants.includes('me@jhserodio.dev'));
  assert.ok(constants.includes('https://leetcode.com/u/serodio/'));
  assert.ok(css.includes('.resume-overview-heading'));
  assert.ok(css.includes('.resume-quick-links'));
  assert.ok(css.includes('@media (max-width: 47rem)'));
});
