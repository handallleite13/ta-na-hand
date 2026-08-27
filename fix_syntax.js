const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
code = code.replace(/跑鞋\/\)\); else if/g, "跑鞋/)); } else if");
fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed syntax error');
