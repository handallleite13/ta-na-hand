const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const start = code.indexOf("if (c.startsWith('esportes') || c === 'bolsas') {");
console.log(code.substring(start, start + 300));
