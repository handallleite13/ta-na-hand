const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
const lines = code.split('\n');
const startIndex = lines.findIndex(l => l.includes("const sub = c.replace('esportes_', '');"));
console.log(lines.slice(startIndex - 2, startIndex + 10).join('\n'));
