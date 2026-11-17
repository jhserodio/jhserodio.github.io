import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import sharp from 'sharp';

async function check(sharp, readFile, stat, assert) {
  const expectedImage = 'https://serodio.dev/social-preview.jpg';
  const destinations = [
    { path: 'dist/index.html', label: 'Main URL', title: 'João Henrique Serodio | Software Engineer & Architect' },
    { path: 'dist/pt/index.html', label: 'PT redirect', title: 'João Henrique Serodio | Engenheiro de Software e Arquiteto' },
    { path: 'dist/en/index.html', label: 'EN redirect', title: 'João Henrique Serodio | Software Engineer & Architect' },
    { path: 'dist/pt/resume/index.html', label: 'PT resume', title: 'João Henrique Serodio | Engenheiro de Software e Arquiteto' },
    { path: 'dist/en/resume/index.html', label: 'EN resume', title: 'João Henrique Serodio | Software Engineer & Architect' },
  ];
  for (const page of destinations) {
    const html = await readFile(page.path, 'utf8');
    const head = html.split('</head>')[0];
    for (const property of ['og:title', 'og:description', 'og:image', 'og:url', 'og:site_name']) {
      assert.ok(head.includes(`property="${property}"`), `${page.label}: missing ${property}`);
    }
    assert.ok(head.includes(page.title.replaceAll('&', '&amp;')) || head.includes(page.title),
      `${page.label}: unexpected title`);
    assert.ok(head.includes(expectedImage), `${page.label}: missing absolute social image URL`);
    assert.ok(head.includes('name="twitter:card"'), `${page.label}: missing Twitter card`);
    assert.ok(!head.includes('Language / Idioma'), `${page.label}: legacy language title leaked`);
    console.log(`Verified ${page.label} social metadata`);
  }
  const meta = await sharp('dist/social-preview.jpg').metadata();
  const st = await stat('dist/social-preview.jpg');
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 630);
  assert.equal(meta.format, 'jpeg');
  assert.ok(st.size < 5 * 1024 * 1024, 'social image is too large for previews');
  console.log(`Verified 1200×630 JPEG image (${st.size} bytes)`);
}
await check(sharp, readFile, stat, assert);
