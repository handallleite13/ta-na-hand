const fs = require('fs');
const code = fs.readFileSync('public/index.html', 'utf8');
const lines = code.split('\n');
const startIndex = lines.findIndex(l => l.includes('document.querySelectorAll(') && l.includes('data-filter'));
console.log(lines.slice(startIndex, startIndex + 30).join('\n'));
