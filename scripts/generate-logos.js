#!/usr/bin/env node

/**
 * Logo Generation Script
 *
 * This script generates different sizes of the logo for various use cases:
 * - favicon.ico (16x16, 32x32, 48x48)
 * - apple-touch-icon.png (180x180)
 * - logo-192.png (192x192)
 * - logo-512.png (512x512)
 *
 * Note: This requires ImageMagick to be installed on the system
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const logoPath = path.join(publicDir, 'logo.svg');

// Check if logo exists
if (!fs.existsSync(logoPath)) {
  console.error('❌ Logo file not found at:', logoPath);
  process.exit(1);
}

console.log('🎨 Generating logo variants...');

try {
  // Generate favicon.ico (multiple sizes)
  console.log('📱 Generating favicon.ico...');
  execSync(`convert ${logoPath} -resize 16x16 ${publicDir}/favicon-16x16.png`);
  execSync(`convert ${logoPath} -resize 32x32 ${publicDir}/favicon-32x32.png`);
  execSync(`convert ${logoPath} -resize 48x48 ${publicDir}/favicon-48x48.png`);

  // Combine into favicon.ico
  execSync(
    `convert ${publicDir}/favicon-16x16.png ${publicDir}/favicon-32x32.png ${publicDir}/favicon-48x48.png ${publicDir}/favicon.ico`
  );

  // Generate app icons
  console.log('📱 Generating app icons...');
  execSync(`convert ${logoPath} -resize 192x192 ${publicDir}/logo-192.png`);
  execSync(`convert ${logoPath} -resize 512x512 ${publicDir}/logo-512.png`);
  execSync(
    `convert ${logoPath} -resize 180x180 ${publicDir}/apple-touch-icon.png`
  );

  // Clean up temporary files
  fs.unlinkSync(path.join(publicDir, 'favicon-16x16.png'));
  fs.unlinkSync(path.join(publicDir, 'favicon-32x32.png'));
  fs.unlinkSync(path.join(publicDir, 'favicon-48x48.png'));

  console.log('✅ Logo variants generated successfully!');
  console.log('📁 Files created:');
  console.log('  - favicon.ico');
  console.log('  - logo-192.png');
  console.log('  - logo-512.png');
  console.log('  - apple-touch-icon.png');
} catch (error) {
  console.error('❌ Error generating logos:', error.message);
  console.log(
    '💡 Make sure ImageMagick is installed: brew install imagemagick'
  );
  process.exit(1);
}
