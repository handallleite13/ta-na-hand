const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Replace the emoji spans with img tags
html = html.replace(/<span class="text-3xl sm:text-4xl shadow-sm drop-shadow-md">🇧🇷<\/span>/, '<img src="https://flagcdn.com/w80/br.png" width="40" alt="Bandeira do Brasil" class="shadow-sm drop-shadow-md rounded-sm">');

html = html.replace(/<span class="text-3xl sm:text-4xl shadow-sm drop-shadow-md">🇨🇳<\/span>/, '<img src="https://flagcdn.com/w80/cn.png" width="40" alt="Bandeira da China" class="shadow-sm drop-shadow-md rounded-sm">');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Replaced emoji flags with images!');
