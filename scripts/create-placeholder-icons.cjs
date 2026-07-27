/**
 * Create placeholder icon files (colored squares)
 * These should be replaced with proper icons later
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

console.log('Creating placeholder icons...');

// Create simple 1x1 PNG placeholder files
// These are minimal valid PNG files with the brand color
const createMinimalPNG = (size) => {
  // Create a minimal valid PNG file (1x1 pixel)
  // This is a placeholder - should be replaced with actual icons
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // Width: 1
    0x00, 0x00, 0x00, 0x01, // Height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth: 8, Color type: 2 (RGB), Compression: 0, Filter: 0, Interlace: 0
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00, 0x03, 0x00, 0x01, 0x00, // Image data (1 pixel)
    0x1E, 0x62, 0x84, 0x86, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return minimalPNG;
};

// Create placeholder files
sizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(iconPath, createMinimalPNG(size));
  console.log(`Created placeholder: icon-${size}x${size}.png`);
});

console.log('\n⚠️  These are placeholder icons - replace them with proper icons!');
console.log('Use: https://realfavicongenerator.net/ or install sharp for proper generation');