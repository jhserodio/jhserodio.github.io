import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (name) => readFileSync(path.join(root, name), 'utf8');

test('resume matches the original section order, leaving projects last', () => {
  const page = read('src/templates/ResumePage.astro');
  const keys = [
    'class="resume-overview"',
    'class="resume-intro-grid"',
    '<SkillBars lang={lang} />',
    'class="resume-work-section"',
    'class="resume-extra-grid"',
    'class="resume-projects"',
  ];
  const offsets = keys.map((key) => {
    const position = page.indexOf(key);
    assert.ok(position >= 0, `Missing resume section: ${key}`);
    return position;
  });
  assert.deepEqual(offsets, [...offsets].sort((a, b) => a - b));
  assert.match(page, /<\/section>\s*<\/article>\s*<\/BaseLayout>/);
});

test('existing resume data is kept, including careers, skill levels and new projects', () => {
  const page = read('src/templates/ResumePage.astro');
  assert.match(page, /getResume\(lang\)/);
  assert.match(page, /resume\.experiences\.map/);
  assert.match(page, /resume\.education\.map/);
  assert.match(page, /resume\.languages\.map/);
  assert.match(page, /resume\.softSkills\.map/);
  assert.match(page, /resume\.projects\.map/);
  assert.match(page, /exp\.technologies\.map/);
  assert.match(page, /me\.contact\.email\.value/);
  assert.match(page, /me\.contact\.github\.value/);
  assert.match(page, /me\.contact\.linkedin\.value/);
});

test('responsive CV layout preserves three-column skills and paired info panels', () => {
  const css = read('src/styles/resume.css');
  assert.match(css, /\.resume-intro-grid\s*\{/);
  assert.match(css, /\.resume-extra-grid\s*\{/);
  assert.match(css, /grid-template-columns:\s*repeat\(3,/);
  assert.match(css, /@media \(max-width: 47rem\)/);
  assert.match(css, /@media print/);
  assert.match(read('src/templates/ResumePage.astro'), /import '\.\.\/styles\/resume\.css'/);
});
