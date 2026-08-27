const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("app.get('/api/latest'"));
console.log(lines.slice(start, start + 30).join('\n'));
