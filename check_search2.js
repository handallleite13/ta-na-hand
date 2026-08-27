const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
const searchIndex = lines.findIndex(l => l.includes("app.get('/api/search'"));
console.log(lines.slice(searchIndex + 50, searchIndex + 150).join('\n'));
