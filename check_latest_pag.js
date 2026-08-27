const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
const lines = code.split('\n');
const startIndex = lines.findIndex(l => l.includes("app.get('/api/latest',"));
console.log(lines.slice(startIndex + 130, startIndex + 150).join('\n'));
