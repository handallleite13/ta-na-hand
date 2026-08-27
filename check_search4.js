const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
const startIndex = lines.findIndex(l => l.includes("// --- GLOBAL ISOLATION FOR LUXO AND OUTROS ---"));
console.log(lines.slice(startIndex, startIndex + 50).join('\n'));
