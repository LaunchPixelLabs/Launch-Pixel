const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function compressLogo() {
  const inputPath = path.join(__dirname, 'public/logo.gif');
  const outputPath = path.join(__dirname, 'public/logo.webp');

  if (!fs.existsSync(inputPath)) {
    console.log('logo.gif not found');
    return;
  }

  try {
    console.log('Compressing logo.gif to webp animation...');
    await sharp(inputPath, { animated: true })
      .webp({ quality: 75, effort: 6 })
      .toFile(outputPath);
    
    const oldSize = fs.statSync(inputPath).size / 1024;
    const newSize = fs.statSync(outputPath).size / 1024;
    
    console.log(`Successfully converted logo!`);
    console.log(`Original: ${oldSize.toFixed(2)} KB`);
    console.log(`New: ${newSize.toFixed(2)} KB`);
    console.log(`Saved: ${((oldSize - newSize) / oldSize * 100).toFixed(1)}%`);
  } catch (err) {
    console.error('Error compressing logo:', err);
  }
}

compressLogo();
