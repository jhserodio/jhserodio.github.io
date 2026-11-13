import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const root = process.cwd();
const vault = process.env.OBSIDIAN_VAULT_DIR;
if (!vault) {
  console.log('[vault] OBSIDIAN_VAULT_DIR não definido: usando apenas conteúdo local.');
  process.exit(0);
}
const src = path.resolve(vault);
const output = path.join(root, 'src/content/articles');
const assetOutput = path.join(root, 'public/vault-assets');
const validAssets = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
const safeSlug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function walk(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const item of items) {
    if (item.name.startsWith('.')) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...await walk(full));
    else if (item.isFile()) files.push(full);
  }
  return files;
}
const files = await walk(src);
const notes = files.filter(p => /\.md$/i.test(p));
const assets = new Map();
for (const file of files.filter(p => validAssets.test(p))) {
  const key = path.basename(file);
  if (assets.has(key)) throw new Error(`Assets de nome duplicado no vault: ${key}. Renomeie um deles.`);
  assets.set(key, file);
}
const staged = [];
const referencedAssets = new Set();
const seen = new Set();
for (const file of notes) {
  const raw = await fs.readFile(file, 'utf8');
  const { data } = matter(raw);
  if (data.publish !== true) continue;
  if (!['pt', 'en'].includes(data.lang)) throw new Error(`Informe lang: pt ou en em ${file}`);
  if (!data.publishedAt || !data.title) throw new Error(`Nota publicada exige title e publishedAt: ${file}`);
  const slug = safeSlug(path.basename(file, '.md'));
  const outputFile = path.join(output, data.lang, 'vault', `${slug}.md`);
  if (seen.has(outputFile)) throw new Error(`Slug duplicado no vault (${data.lang}): ${slug}`);
  seen.add(outputFile);
  for (const match of raw.matchAll(/!\[\[([^\]]+)\]\]/g)) {
    const filename = path.basename(match[1].split('|')[0]);
    if (!validAssets.test(filename)) continue;
    if (!assets.has(filename)) throw new Error(`Embed não encontrado em ${file}: ${filename}`);
    referencedAssets.add(filename);
  }
  staged.push({ outputFile, raw });
}
// Só limpa o conteúdo gerado pelo sync, nunca artigos escritos manualmente.
for (const lang of ['pt', 'en']) {
  await fs.rm(path.join(output, lang, 'vault'), { recursive: true, force: true });
}
await fs.rm(assetOutput, { recursive: true, force: true });
await fs.mkdir(assetOutput, { recursive: true });
for (const { outputFile, raw } of staged) {
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, raw);
}
for (const name of referencedAssets) await fs.copyFile(assets.get(name), path.join(assetOutput, name));
console.log(`[vault] ${staged.length} notas publicadas, ${referencedAssets.size} imagens sincronizadas.`);
