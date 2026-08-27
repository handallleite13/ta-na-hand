const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const startIndex = code.indexOf("if (c.startsWith('esportes') || c === 'bolsas') {");
console.log(code.substring(startIndex, startIndex + 500));
