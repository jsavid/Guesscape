const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');

// Clean or recreate www folder
if (fs.existsSync(wwwDir)) {
  fs.rmSync(wwwDir, { recursive: true, force: true });
}
fs.mkdirSync(wwwDir, { recursive: true });

// Items to copy to www
const itemsToCopy = [
  'index.html',
  'style.css',
  'assets',
  'capitals',
  'flag',
  'map'
];

itemsToCopy.forEach(item => {
  const src = path.join(__dirname, item);
  const dest = path.join(wwwDir, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`Copied ${item} -> www/${item}`);
  }
});

console.log('Build completed successfully!');
