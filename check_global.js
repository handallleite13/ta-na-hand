const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes("if (c === 'luxo'"));
console.log(lines.slice(start - 2, start + 25).join('\n'));
