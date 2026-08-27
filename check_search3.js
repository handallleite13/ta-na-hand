const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
const startIndex = lines.findIndex(l => l.includes("if (c.startsWith('calcados')) {"));
console.log(lines.slice(startIndex, startIndex + 30).join('\n'));
