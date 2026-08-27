const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
code = code.replace(/c\.startsWith\('luxo_'\)/g, "(c === 'luxo' || c.startsWith('luxo_'))");
fs.writeFileSync('server.js', code, 'utf8');
console.log('Luxo patched:', code.includes("(c === 'luxo' || c.startsWith('luxo_'))"));
