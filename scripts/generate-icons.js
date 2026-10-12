import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgBuffer = fs.readFileSync('public/icon.svg');

async function generate() {
  console.log('Generating PWA icons with sharp...');
  
  // 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  
  // 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');

  // Maskable 512x512 with safe-zone margin (scale content inside, full background)
  // Our SVG already has a dark squircle; with padding it fits nicely.
  await sharp(svgBuffer)
    .resize(440, 440)
    .extend({
      top: 36,
      bottom: 36,
      left: 36,
      right: 36,
      background: '#0f172a'
    })
    .png()
    .toFile('public/pwa-maskable-512x512.png');

  // Apple Touch Icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  console.log('Icons generated successfully!');
}

generate().catch(console.error);
