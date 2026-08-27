const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
const searchIndex = code.indexOf("app.get('/api/latest'");
const searchCode = code.substring(searchIndex, searchIndex + 800);
const start = searchCode.indexOf("if (c.startsWith('esportes') || c === 'bolsas') {");
console.log(searchCode.substring(start, start + 300));
