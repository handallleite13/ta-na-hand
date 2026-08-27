const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Replace all instances where item.titulo is used for matching in filters to use original
code = code.replace(/\(item\.titulo \|\| ''\)\.toLowerCase\(\)/g, "(item.original || item.titulo || '').toLowerCase()");

fs.writeFileSync('server.js', code, 'utf8');
console.log('Patched all regex filters to use item.original!');
