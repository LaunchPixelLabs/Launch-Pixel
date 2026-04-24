const fs = require('fs');
const path = require('path');

const exts = ['.tsx', '.ts'];
const dirs = ['app', 'components'];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (exts.includes(path.extname(fullPath))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('.png')) {
        // Need to be careful: only replace '.png"' or '.png`' or '.png\'' or apple-touch-icon etc,
        // Wait, just replace \.png with \.webp except for favicon.png and icon.png
        
        // Let's replace only specific images
        const toReplace = ['/Aryan.png', '/Shivanshu.png', '/vielorine.png', '/rocket.png', '/madhavfabrications.png', '/vibecast.png', '/varanasionwheels.png', '/sunilbookstore.png', '/viveksharma.png', '/sharansmusicacademy.png', '/Akansh.png', '/logo1.png', '/logo2.png', '/logo3.png', '/logo4.png', '/logo5.png', '/logo6.png', '/logo7.png', '/logo8.png', '/logo9.png', '/logo10.png', '/akonomics.png', '/prajapatiagro.png', '/mornova.png'];
        
        let changed = false;
        toReplace.forEach(img => {
          if (content.includes(img)) {
            content = content.split(img).join(img.replace('.png', '.webp'));
            changed = true;
          }
        });
        
        if (changed) {
          fs.writeFileSync(fullPath, content);
          console.log(`Updated ${fullPath}`);
        }
      }
    }
  }
}

dirs.forEach(d => {
  if (fs.existsSync(d)) processDir(d)
});
console.log('Update complete.');
