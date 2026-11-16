import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

// Imports the artwork from the author's own public Medium RSS feed.
// Each entry was visually identified with the files uploaded for this project.
// Fail closed if Medium changes its images instead of importing unrelated media.
const definitions = [
  { title: 'Module 2: Array Optimization', assets: [['math-with-rust-module-2.webp', '23ececdc74f4f030']] },
  { title: 'Debugging Rust from the Terminal', assets: [['debugging-rust-gdb.webp', '23dcecd454d4d034']] },
  { title: 'Debugging C/C++ from the Terminal', assets: [['debugging-c-gdb.webp', '23dcecd454d4d034']] },
  { title: 'A Real-World Guide to Collections', assets: [
    ['collections-pointers-sorting.webp', '55672b391b363d73'],
    ['table-test-bubble-sort.webp', '826868686a68686a'],
    ['table-test-selection-sort.webp', '806e6c686a68686c'],
    ['table-test-insertion-sort.webp', '816c6c6c6c2a6868'],
  ] },
  { title: 'First Steps with Programming Algorithms', assets: [['first-steps-control-flow.webp', '232bac94121b1b1a']] },
  { title: 'Mathematical Discretization in Computing', assets: [
    ['mathematical-discretization.webp', '2723270e371e071e'],
    ['continuous-function-curve.webp', '3091985555662610'],
    ['floor-function-curve.webp', '3054911155556676'],
  ] },
  { title: 'O mínimo que vc precisa saber sobre Terminal Linux', assets: [['linux-terminal-basic.webp', '1c0f1f33130c1314']] },
    { title: 'Math with Rust', assets: [['math-with-rust-roadmap.webp', '835910b34a183465']] },
];
const root = process.cwd();
const mediaDir = join(root, 'public', 'article-images');
const articleDir = join(root, 'src', 'content', 'articles');
const rssResponse = await fetch('https://medium.com/feed/@jhserodio', {
  headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/rss+xml' },
});
if (!rssResponse.ok) throw new Error('Medium RSS returned HTTP ' + rssResponse.status);
const rss = await rssResponse.text();
const items = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([,xml]) => {
  const title = xml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ?? '';
  const html = xml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] ?? '';
  const images = [...html.matchAll(/<img[^>]+?src=["']([^"']+)["']/g)]
    .map((m)=>m[1])
    .filter((url)=>url.startsWith('https://cdn-images-1.medium.com/'));
  return { title, html, images };
});
if (items.length < 9) throw new Error('Expected public author feed to include all nine source articles');

const imageSources = new Map();
for (const def of definitions) {
  const item = items.find((x)=>x.title.startsWith(def.title));
  if (!item) throw new Error('Original article missing from feed: '+def.title);
  if (item.images.length !== def.assets.length) {
    throw new Error('Unexpected source image count for '+def.title+': expected '+def.assets.length+', got '+item.images.length);
  }
  for (let i=0; i<def.assets.length; i++) {
    const [name, expectedHash] = def.assets[i];
    imageSources.set(name, {url:item.images[i], expectedHash, articleTitle: def.title});
  }
  def.item = item;
}
if (imageSources.size!==13) throw new Error('Expected exactly 13 validated source artworks');

function imageHash(raw) {
  // Sharp's grayscale Lanczos resampling is comparable to the Pillow
  // 9x8 dHash calculated from the user's uploaded image.
  return sharp(raw).resize(9, 8, {fit:'fill',kernel:'lanczos3'})
    .greyscale().removeAlpha().raw().toBuffer({resolveWithObject:true})
    .then(({data,info})=>{
      let hash=0n;
      for(let y=0;y<8;y++) for(let x=0;x<8;x++) {
        const a=data[(y*9+x)*info.channels],b=data[(y*9+x+1)*info.channels];
        hash=(hash<<1n)|(a>b?1n:0n);
      }
      return hash;
    });
}
function distance(a,b) {
  let d=BigInt(a)^BigInt('0x'+b),count=0;
  while(d){count+=Number(d&1n);d>>=1n;}
  return count;
}
async function downloadImage(url) {
  const urls = [url.replace('/max/1024/', '/max/2000/'),url];
  for (const candidate of urls) {
    const response=await fetch(candidate,{headers:{'User-Agent':'Mozilla/5.0',Accept:'image/*'}});
    if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
      return Buffer.from(await response.arrayBuffer());
    }
    console.log('Image endpoint unavailable',response.status,candidate.slice(0,110));
  }
  throw new Error('Cannot fetch source image from '+url);
}
await mkdir(mediaDir,{recursive:true});
for (const [name, data] of imageSources) {
  const source = await downloadImage(data.url);
  const diff=distance(await imageHash(source),data.expectedHash);
  console.log('Image verification:',name,'dHash distance:',diff,'bytes:',source.length);
  if (diff>18) throw new Error('Source image differs from user upload: '+name+' (distance '+diff+')');
  let result;
  if (name.endsWith('.jpg')) result=await sharp(source).jpeg({quality:91,mozjpeg:true}).toBuffer();
  else result=await sharp(source).webp({quality:89,effort:6}).toBuffer();
  await writeFile(join(mediaDir,name),result);
}
const covers = [
  {files:['en/math-with-rust-roamap-series.md','pt/matematica-com-rust-roadmap.md'],old:'/math-with-rust-series-cover.svg',name:'math-with-rust-roadmap.webp'},
  {files:['en/math-with-rust-module-2.md','pt/matematica-com-rust-modulo-2.md'],old:'/math-with-rust-mod2-cover.svg',name:'math-with-rust-module-2.webp'},
  {files:['en/linux-terminal-basic.md','pt/basico-linux-terminal.md'],old:'/linux-terminal-grimoire-cover.svg',name:'linux-terminal-basic.webp'},
  {files:['en/control-flow-mathematical-algorithms.md','pt/controle-de-fluxo-e-algoritmos-matematicos.md'],old:'/algorithms-control-flow-cover.svg',name:'first-steps-control-flow.webp'},
  {files:['en/debugging-c.md','pt/debuggando-c.md'],old:'/debugging-gcc-gdb-cover.svg',name:'debugging-c-gdb.webp'},
  {files:['en/debugging-rust.md','pt/dubugando-rust.md'],old:'/debugging-rust-gdb-cover.svg',name:'debugging-rust-gdb.webp'},
];
for(const cover of covers) for(const relative of cover.files) {
  const file=join(articleDir,relative);
  const before=await readFile(file,'utf8');
  const after=before
    .replace(/^cover:\s*.+$/m,'cover: "/article-images/'+cover.name+'"')
    .replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, figure=>figure.includes(cover.old)?'':figure)
    .replaceAll(cover.old,'/article-images/'+cover.name);
  if(before===after)throw new Error('Expected article cover was not updated: '+relative);
  await writeFile(file,after);
  console.log('Updated article cover:',relative);
}

// The two original manuscripts were missing from this repository. Recover
// their published author-written HTML instead of inventing replacement text.
// HTML is valid within the site's Markdown content pipeline.
const missingArticles = [
  {prefix:'Mathematical Discretization in Computing',filename:'mathematical-discretization-in-computing.md',
    date:'2026-08-25',translationKey:'mathematical-discretization-in-computing',
    tags:'[mathematics, numerical-methods, rust, discretization]',description:'From continuous mathematical functions to finite machine precision, rounding, truncation and discrete numeric representations.'},
  {prefix:'A Real-World Guide to Collections',filename:'collections-pointers-sorting-c-rust.md',
    date:'2026-09-02',translationKey:'collections-pointers-sorting-c-rust',
    tags:'[c, rust, algorithms, pointers, sorting]',description:'An engineering guide to collections, pointers and sorting algorithms in C and Rust, illustrated with sorting trace tables.'},
];
for(const spec of missingArticles) {
  const def=definitions.find(x=>x.title===spec.prefix);
  const article=def.item;
  let html=article.html;
  // The article header already renders the cover from frontmatter.
  const firstImage=article.images[0];
  html=html.replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi,figure=>
    figure.includes(firstImage)?'':figure);
  for(let i=0;i<def.assets.length;i++) {
    html=html.replaceAll(article.images[i],'/article-images/'+def.assets[i][0]);
  }
  const cover='/article-images/'+def.assets[0][0];
  const front='---\n'+
    'title: '+JSON.stringify(article.title)+'\n'+
    'description: '+JSON.stringify(spec.description)+'\n'+
    'lang: en\ntranslationKey: '+spec.translationKey+'\n'+
    'publishedAt: '+spec.date+'\n'+
    'tags: '+spec.tags+'\n'+
    'cover: '+JSON.stringify(cover)+'\n'+
    'publish: true\n---\n\n';
  const file=join(articleDir,'en',spec.filename);
  try { await access(file); throw new Error('Refusing to overwrite existing manuscript: '+file); }
  catch(e) { if (e.code!=='ENOENT') throw e; }
  await writeFile(file,front+html+'\n');
  console.log('Restored missing published article:',spec.filename);
}

const test=String.raw`import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../', import.meta.url));
test('all 14 originally supplied article images exist in the published assets',()=>{
 const names=__ASSETS__;
 for (const name of names) assert.ok(existsSync(path.join(root,'public/article-images',name)),name);
});
test('article covers point to imported images rather than missing SVG placeholders',()=>{
 const files=__ARTICLES__;
 for(const file of files) {
   const content=readFileSync(path.join(root,'src/content/articles',file),'utf8');
   assert.ok(content.includes('cover: "\/article-images/'), 'Expected a local article cover in '+file);
 }
});
`
  .replace('__ASSETS__',JSON.stringify([...imageSources.keys()]))
  .replace('__ARTICLES__',JSON.stringify(covers.flatMap(x=>x.files)));
await writeFile(join(root,'tests','article-images.test.mjs'),test);
console.log('Imported 13 image matches, updated 12 existing translated articles, restored 2 published EN manuscripts; the Module 1 uploaded cover needs exact binary transfer.');
