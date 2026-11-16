import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../', import.meta.url));
test('all 14 originally supplied article images exist in the published assets',()=>{
 const names=["math-with-rust-module-2.webp","debugging-rust-gdb.webp","debugging-c-gdb.webp","collections-pointers-sorting.webp","table-test-bubble-sort.webp","table-test-selection-sort.webp","table-test-insertion-sort.webp","first-steps-control-flow.webp","mathematical-discretization.webp","continuous-function-curve.webp","floor-function-curve.webp","linux-terminal-basic.webp","math-with-rust-roadmap.webp"];
 for (const name of names) assert.ok(existsSync(path.join(root,'public/article-images',name)),name);
});
test('article covers point to imported images rather than missing SVG placeholders',()=>{
 const files=["en/math-with-rust-roamap-series.md","pt/matematica-com-rust-roadmap.md","en/math-with-rust-module-2.md","pt/matematica-com-rust-modulo-2.md","en/linux-terminal-basic.md","pt/basico-linux-terminal.md","en/control-flow-mathematical-algorithms.md","pt/controle-de-fluxo-e-algoritmos-matematicos.md","en/debugging-c.md","pt/debuggando-c.md","en/debugging-rust.md","pt/dubugando-rust.md"];
 for(const file of files) {
   const content=readFileSync(path.join(root,'src/content/articles',file),'utf8');
   assert.ok(content.includes('cover: "\/article-images/'), 'Expected a local article cover in '+file);
 }
});
