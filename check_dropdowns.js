const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('<select id="category"'));
console.log(lines.slice(start, start + 25).join('\n'));
