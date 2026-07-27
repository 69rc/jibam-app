/**
 * Create placeholder splash screen files
 * These should be replaced with proper splash screens later
 */

const fs = require('fs');
const path = require('path');

const splashSizes = [
  { width: 640, height: 1136 },
  { width: 750, height: 1334 },
  { width: 1242, height: 2208 },
  { width: 1125, height: 2436 },
  { width: 828, height: 1792 },
  { width: 1242, height: 2688 },
  { width: 1536, height: 2048 },
  { width: 1668, height: 2388 },
  { width: 2048, height: 2732 }
];

const splashDir = path.join(__dirname, '../public/splash');

console.log('Creating placeholder splash screens...');

// Create minimal PNG placeholder files
const createMinimalPNG = () => {
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00,
    0x90, 0x77, 0x53, 0xDE,
    0x00, 0x00, 0x00, 0x0C,
    0x49, 0x44, 0x41, 0x54,
    0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00, 0x03, 0x00, 0x01, 0x00,
    0x1E, 0x62, 0x84, 0x86,
    0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);
  
  return minimalPNG;
};

// Create placeholder files
splashSizes.forEach(({ width, height }) => {
  const splashPath = path.join(splashDir, `splash-${width}x${height}.png`);
  fs.writeFileSync(splashPath, createMinimalPNG());
  console.log(`Created placeholder: splash-${width}x${height}.png`);
});

console.log('\n⚠️  These are placeholder splash screens - replace them with proper ones!');
console.log('Use: https://apptools.io/pwa-splash-screen-generator/ or similar tools');