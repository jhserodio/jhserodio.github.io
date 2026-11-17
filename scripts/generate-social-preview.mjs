import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

async function generate(sharp, mkdir, stat, fileURLToPath, path) {
  const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
  const photo = path.join(publicDir, 'profile-portrait.webp');
  const result = path.join(publicDir, 'social-preview.jpg');
  const size = 420;
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="210" cy="210" r="207" fill="white"/></svg>`);
  const avatar = await sharp(photo)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // The original 2019 dark-blue palette and subtle 12px grid.
  // JPEG gives LinkedIn a supported OG image format rather than SVG/WebP.
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1d242e"/>
      <stop offset=".75" stop-color="#10151d"/>
      <stop offset="1" stop-color="#172232"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="42%" r="72%">
      <stop offset="0" stop-color="#435975" stop-opacity=".30"/>
      <stop offset="1" stop-color="#10151d" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M12 0H0V12" fill="none" stroke="#ffffff" stroke-opacity=".052" stroke-width=".6"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#background)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <path d="M 65 68 H 1120" stroke="#435975" stroke-opacity=".65" stroke-width="2"/>
  <rect x="60" y="134" width="8" height="288" rx="4" fill="#8fc9ff"/>
  <g font-family="DejaVu Sans, Liberation Sans, sans-serif">
    <text x="94" y="220" fill="#e6edf6" font-size="51" font-weight="700">João Henrique</text>
    <text x="94" y="290" fill="#8fc9ff" font-size="58" font-weight="700">Serodio</text>
    <text x="95" y="361" fill="#e6edf6" font-size="21" font-weight="600" letter-spacing="1.8">SOFTWARE ENGINEER · ARCHITECT</text>
    <text x="95" y="407" fill="#b0bed0" font-size="22">Rust · Distributed Systems · Applied Mathematics</text>
    <text x="95" y="543" fill="#8fc9ff" font-size="29" font-weight="600">serodio.dev</text>
  </g>
  <circle cx="970" cy="315" r="221" fill="#10151d" stroke="#8fc9ff" stroke-opacity=".5" stroke-width="3"/>
  <path d="M 65 571 H 1120" stroke="#435975" stroke-opacity=".65" stroke-width="2"/>
</svg>`;
  await mkdir(publicDir, { recursive: true });
  await sharp(Buffer.from(svg))
    .composite([{ input: avatar, left: 760, top: 105 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(result);
  const meta = await sharp(result).metadata();
  if (meta.width !== 1200 || meta.height !== 630 || meta.format !== 'jpeg') {
    throw new Error('Invalid generated social image');
  }
  const stats = await stat(result);
  console.log(`Generated LinkedIn card: 1200x630 JPEG, ${stats.size} bytes`);
}
await generate(sharp, mkdir, stat, fileURLToPath, path);
