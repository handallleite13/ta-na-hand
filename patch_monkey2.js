const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Remove the broken toggleFav monkey patch block
const monkeyPatchBlockRegex = /const originalToggleFav = toggleFav;[\s\S]*?renderFavsModal\(\);\s*\}\s*\};\s*/;
html = html.replace(monkeyPatchBlockRegex, '');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed broken toggleFav monkey-patch block!');
