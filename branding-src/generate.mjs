// NexBrowser marka varlıklarını branding-src/*.svg'den üretir → configs/branding/release
// Kullanım: node branding-src/generate.mjs
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SRC = 'branding-src';
const OUT = 'configs/branding/release';
const LOGO = join(SRC, 'logo.svg');
const PRIV = join(SRC, 'logo-private.svg');
const tmp = mkdtempSync(join(tmpdir(), 'nexbrand-'));

const png = (svg, size, out) =>
  sharp(svg, { density: Math.max(72, (size / 1024) * 72 * 2) }).resize(size, size).png().toFile(out);

// İkonu bir tuvalin ortasına yerleştir (Windows döşeme/ yükleyici görselleri için)
async function centered(svg, w, h, iconSize, bg, out) {
  const icon = await sharp(svg, { density: 144 }).resize(iconSize, iconSize).png().toBuffer();
  await sharp({ create: { width: w, height: h, channels: 4, background: bg } })
    .composite([{ input: icon, gravity: 'centre' }]).png().toFile(out);
}

function ico(svg, sizes, out) {
  return Promise.all(sizes.map((s) => png(svg, s, join(tmp, `${out}-${s}.png`)))).then(() =>
    execFileSync('magick', [...sizes.map((s) => join(tmp, `${out}-${s}.png`)), join(OUT, out)]));
}

const sizes = [16, 22, 24, 32, 48, 64, 128, 256, 512, 1024];
await Promise.all(sizes.map((s) => png(LOGO, s, join(OUT, `logo${s}.png`))));
await png(LOGO, 1024, join(OUT, 'logo.png'));
await png(LOGO, 1024, join(OUT, 'logo-mac.png'));

const icoSizes = [16, 32, 48, 64, 128, 256];
await ico(LOGO, icoSizes, 'firefox.ico');
await ico(LOGO, icoSizes, 'firefox64.ico');
await ico(LOGO, icoSizes, 'document.ico');
await ico(LOGO, icoSizes, 'document_pdf.ico');
await ico(PRIV, icoSizes, 'pbmode.ico');
execFileSync('python3', [join(SRC, 'icns.py'), join(OUT, 'firefox.icns'), OUT]);

await png(PRIV, 126, join(OUT, 'PrivateBrowsing_70.png'));
await png(PRIV, 270, join(OUT, 'PrivateBrowsing_150.png'));
const tile = { r: 0x11, g: 0x12, b: 0x14, alpha: 1 };
await centered(LOGO, 1042, 1046, 620, tile, join(OUT, 'VisualElements_150.png'));
await centered(LOGO, 1042, 1046, 620, tile, join(OUT, 'VisualElements_70.png'));
await centered(LOGO, 164, 314, 112, tile, join(tmp, 'wiz.png'));
execFileSync('magick', [join(tmp, 'wiz.png'), '-alpha', 'off', 'BMP3:' + join(OUT, 'wizWatermark.bmp')]);

copyFileSync(LOGO, join(OUT, 'content/about-logo.svg'));
copyFileSync(PRIV, join(OUT, 'content/about-logo-private.svg'));
copyFileSync(LOGO, join(OUT, 'MacOSInstaller.svg'));
copyFileSync(join(SRC, 'about-wordmark.svg'), join(OUT, 'content/about-wordmark.svg'));
copyFileSync(join(SRC, 'firefox-wordmark.svg'), join(OUT, 'content/firefox-wordmark.svg'));
await png(LOGO, 512, join(OUT, 'content/about-logo.png'));
await png(LOGO, 1024, join(OUT, 'content/about-logo@2x.png'));
await png(PRIV, 192, join(OUT, 'content/about-logo-private.png'));
await png(PRIV, 384, join(OUT, 'content/about-logo-private@2x.png'));

rmSync(tmp, { recursive: true, force: true });
console.log('NexBrowser marka varlıkları üretildi →', OUT);
