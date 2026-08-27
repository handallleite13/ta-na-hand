const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');
const lines = code.split('\n');
const alt = lines.findIndex(l => l.includes("document.getElementById('category')"));
console.log(lines.slice(alt, alt + 40).join('\n'));
