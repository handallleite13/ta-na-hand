const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');
const lines = code.split('\n');
const alt = lines.findIndex(l => l.includes("let category = document.getElementById('category').value;"));
console.log(lines.slice(alt, alt + 15).join('\n'));
