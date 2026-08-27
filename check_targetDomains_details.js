const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
const searchIndex = lines.findIndex(l => l.includes("app.get('/api/search'"));
lines.slice(searchIndex).forEach((l, i) => {
  if (l.includes('targetDomains')) console.log(i + ': ' + l);
});
