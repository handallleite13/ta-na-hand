const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');
const lines = code.split('\n');
const startIndex = lines.findIndex(l => l.includes('<select id="category"'));
console.log(lines.slice(startIndex, startIndex + 25).join('\n'));
