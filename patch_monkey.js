const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Remove the broken monkey patch block
const monkeyPatchBlockRegex = /\/\/ Update addToCart to update favs modal if open[\s\S]*?renderFavsModal\(\);\s*\}\s*\};\s*/;
html = html.replace(monkeyPatchBlockRegex, '');

// 2. Insert into window.toggleFav
const toggleFavRegex = /(localStorage\.setItem\('tnh_favs', JSON\.stringify\(favorites\)\);\s*updateCounts\(\);\s*)/;
html = html.replace(toggleFavRegex, `$1\n      if (!document.getElementById('modal-favs').classList.contains('hidden')) {\n        renderFavsModal();\n      }\n      `);

// 3. Insert into window.addToCart
const addToCartRegex = /(localStorage\.setItem\('tnh_cart', JSON\.stringify\(cart\)\);\s*updateCounts\(\);\s*)/;
html = html.replace(addToCartRegex, `$1\n      if (!document.getElementById('modal-favs').classList.contains('hidden')) {\n        renderFavsModal();\n      }\n      `);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed broken monkey-patch block!');
