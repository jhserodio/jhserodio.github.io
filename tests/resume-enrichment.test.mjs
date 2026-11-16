import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFileSync(path.join(root, file), 'utf8');

test('both CV locales explicitly connect applied mathematics and Rust to documented roles', () => {
  const source = read('src/i18n/resume/enrichment.ts');
  for (const term of [
    'Pedido Sugerido', 'Suggestion Order',
    'Rust', 'Days on Hand', 'stochastic methods', 'métodos estocásticos',
    '30% para 90%', '30% to 90%', 'uma semana para duas horas', 'one week to two hours',
    'CDN', 'Axum', 'SQLx', 'WebAssembly', 'EMQX', 'DAG',
  ]) assert.ok(source.includes(term), 'CV evidence missing: '+term);
  assert.match(source, /pt:\s*\{/);
  assert.match(source, /en:\s*\{/);
});

test('project highlights, bilingual summaries and technologies are wired into resume', () => {
  const data = read('src/i18n/resume-data.ts');
  const schema = read('src/i18n/schema.ts');
  const page = read('src/templates/ResumePage.astro');
  const style = read('src/styles/resume.css');
  const extras = read('src/i18n/resume/enrichment.ts');
  assert.ok(data.includes('experienceExtras[lang][id]'));
  assert.ok(data.includes('projectExtras[lang][project.title]'));
  assert.ok(data.includes('summary: summaries[lang]'));
  assert.ok(data.includes('projects: enrichedProjects'));
  assert.ok(schema.includes('highlights: z.array(z.string().min(1)).default([])'));
  assert.ok(page.includes('project.highlights.map('));
  assert.ok(page.includes('project.links.articleSlug'));
  assert.ok(page.includes('localePath(lang,'));
  assert.ok(style.includes('.resume-project-highlights'));
  assert.ok(extras.includes('237 exercises'));
  assert.ok(extras.includes('237 exercícios'));
  for (const name of ['Quantitative Developer Roadmap', 'vim-grimory', 'Vision Transformer Optimization — Scientific Research', 'Self-hosted Qwen Code Agent', 'Capacitated Vehicle Routing — Deterministic to Stochastic']) {
    assert.equal(extras.split("'"+name+"': {").length-1,2,name+' must be enriched in both locales');
  }
});

test('sources and academic status remain intact', () => {
  const data = read('src/i18n/resume-data.ts');
  const pt = read('src/i18n/resume/pt.ts');
  const en = read('src/i18n/resume/en.ts');
  for (const key of ['boticario','vnator','nzn','pagarme','kovi','pedePronto','agrotis','polvo','freelance']) {
    assert.ok(pt.includes(key+': {'),key+' missing from PT source');
    assert.ok(en.includes(key+': {'),key+' missing from EN source');
  }
  assert.ok(data.includes("institution: 'UNICENTRO — Universidade Estadual do Centro-Oeste'"));
  assert.ok(data.includes("period: { start: '2024', end: null }"));
  assert.ok(data.includes("category: 'academic' as const"));
  assert.ok(data.includes("ResumeSchema.parse"));
});
