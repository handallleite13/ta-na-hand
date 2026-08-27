const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const searchIndex = code.indexOf("app.get('/api/search'");
const searchCode = code.substring(searchIndex, code.indexOf("app.get('/api/latest'"));
const start = searchCode.indexOf("if (c.startsWith('esportes') || c === 'bolsas') {");
console.log(searchCode.substring(start, start + 300));
