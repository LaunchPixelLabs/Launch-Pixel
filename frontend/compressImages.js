const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else if (file.match(/\.(png|jpe?g)$/i) && !file.includes('favicon')) {
      const ext = path.extname(file);
      const webpPath = filePath.replace(new RegExp(`${ext}$`, 'i'), '.webp');
      try {
        console.log(`Converting ${file} to webp...`);
        await sharp(filePath)
          .webp({ quality: 80, effort: 6 })
          .toFile(webpPath);
        
        // Remove original file
        fs.unlinkSync(filePath);
        console.log(`Successfully converted and deleted original ${file}`);
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
  }
}

processDirectory(publicDir).then(() => {
  console.log('Done converting images to WebP.');
});
