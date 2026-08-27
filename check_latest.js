const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
const startIndex = lines.findIndex(l => l.includes("app.get('/api/latest'"));
const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes("app.get('/api/search'"));
console.log(lines.slice(startIndex, endIndex).join('\n'));
