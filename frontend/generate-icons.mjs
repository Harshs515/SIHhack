// generate-icons.mjs — Run with: node generate-icons.mjs
// Resizes the source icon to all required PWA sizes
import sharp from 'sharp';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = process.argv[2] || join(__dirname, 'source-icon.jpg');
const OUT = join(__dirname, 'public', 'icons');

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function run() {
  console.log(`🎨 Generating PWA icons from: ${SRC}`);
  for (const size of SIZES) {
    const outFile = join(OUT, `icon-${size}.png`);
    await sharp(SRC).resize(size, size, { fit: 'cover' }).png().toFile(outFile);
    console.log(`  ✅ icon-${size}.png`);
  }

  // Maskable icons (add safe zone padding — 10% on each side)
  for (const size of [192, 512]) {
    const innerSize = Math.floor(size * 0.8);
    const outFile = join(OUT, `icon-maskable-${size}.png`);
    const resized = await sharp(SRC).resize(innerSize, innerSize, { fit: 'cover' }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: '#070b14' } })
      .composite([{ input: resized, gravity: 'center' }])
      .png()
      .toFile(outFile);
    console.log(`  ✅ icon-maskable-${size}.png (maskable)`);
  }

  // Screenshot placeholders (solid color with text)
  console.log('\n📸 Creating screenshot placeholders...');
  const desktopOut = join(OUT, 'screenshot-desktop.png');
  const mobileOut = join(OUT, 'screenshot-mobile.png');
  await sharp({ create: { width: 1280, height: 720, channels: 4, background: '#070b14' } }).png().toFile(desktopOut);
  await sharp({ create: { width: 390, height: 844, channels: 4, background: '#070b14' } }).png().toFile(mobileOut);
  console.log('  ✅ screenshot-desktop.png');
  console.log('  ✅ screenshot-mobile.png');

  console.log('\n🚀 All icons generated successfully!');
}

run().catch(console.error);
