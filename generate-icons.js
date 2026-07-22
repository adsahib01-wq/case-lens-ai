const fs = require('fs');
const sharp = require('sharp');

const svgBuffer = fs.readFileSync('public/logo.svg');

if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons', { recursive: true });
}

async function generate() {
  try {
    await sharp(svgBuffer)
      .resize(192, 192)
      .toFile('public/icons/icon-192.png');
    
    await sharp(svgBuffer)
      .resize(512, 512)
      .toFile('public/icons/icon-512.png');
      
    await sharp(svgBuffer)
      .resize(512, 512)
      .flatten({ background: '#ffffff' })
      .toFile('public/icons/icon-maskable-512.png');
      
    console.log('Icons generated successfully.');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generate();
