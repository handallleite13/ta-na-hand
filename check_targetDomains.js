const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
const searchIndex = lines.findIndex(l => l.includes("app.get('/api/search'"));
const searchLines = lines.slice(searchIndex);
let targetDomainCount = 0;
searchLines.forEach(l => { if (l.includes('targetDomains')) targetDomainCount++; });
console.log('targetDomains usages in /api/search:', targetDomainCount);
