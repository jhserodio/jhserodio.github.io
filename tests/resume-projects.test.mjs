import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (name) => readFileSync(path.join(root, name), 'utf8');

test('resume contains all five public projects and preserves both originals', () => {
  const source = read('src/i18n/resume-data.ts');
  const repos = [
    'vnator/quant-dev-roadmap',
    'jhserodio/vim-grimory',
    'jhserodio/exploring-vit-algorithms-improvments',
    'vnator/selfhosted-qwen-codeagent',
    'jhserodio/logistic_problem_with_max_capacity',
  ];
  for (const repo of repos) {
    assert.equal(source.split('https://github.com/' + repo).length - 1, 1,
      `Expected exactly one project entry for ${repo}`);
  }
});

test('research and developing projects are not described as finished products', () => {
  const source = read('src/i18n/resume-data.ts');
  assert.match(source, /protótipo em desenvolvimento/);
  assert.match(source, /prototype in progress/);
  assert.match(source, /em fase de formulação determinística/);
  assert.match(source, /deterministic formulation stage/);
  assert.match(source, /evolução planejada/);
  assert.match(source, /planned stochastic extension/);
  assert.match(source, /approval-gated edit proposals/);
});

test('project categories render localized labels for both languages', () => {
  const page = read('src/templates/ResumePage.astro');
  assert.match(page, /projectCategoryLabels\[lang\]\[project\.category\]/);
  for (const text of ["Acadêmico", "Código aberto", "Academic", "Open source"]) {
    assert.ok(page.includes(text), `Missing project category label: ${text}`);
  }
  assert.ok(page.indexOf('class="resume-projects"') > page.indexOf('class="resume-extra-grid"'));
});
