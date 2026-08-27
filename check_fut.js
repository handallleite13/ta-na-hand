const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
const start = code.indexOf("else if (sub === 'futebol') {");
console.log(code.substring(start, start + 500));
