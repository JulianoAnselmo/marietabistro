const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const LOGO = path.join(ROOT, 'imagens', 'logo-marieta.png');
const BG = { r: 3, g: 36, b: 57, alpha: 1 }; // #032439

async function makeFavicon(size, outPath) {
  // Padding ~12% so the logo doesn't touch edges
  const pad = Math.round(size * 0.12);
  const innerW = size - pad * 2;
  const innerH = size - pad * 2;

  const logoBuf = await sharp(LOGO)
    .resize({ width: innerW, height: innerH, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png()
    .toFile(outPath);

  console.log('wrote', outPath);
}

(async () => {
  await makeFavicon(48, path.join(ROOT, 'favicon-48.png'));
  await makeFavicon(96, path.join(ROOT, 'favicon-96.png'));
  await makeFavicon(192, path.join(ROOT, 'favicon-192.png'));
  await makeFavicon(512, path.join(ROOT, 'favicon-512.png'));
  await makeFavicon(180, path.join(ROOT, 'apple-touch-icon.png'));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
