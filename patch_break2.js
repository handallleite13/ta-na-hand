const fs = require('fs');
let code = fs.readFileSync('sync.js', 'utf8');

// Replace jaExistentes break block
code = code.replace(/if\s*\(jaExistentesNaSequencia\s*>=\s*10\s*&&\s*!cat\.href\.includes\('\/categories\?page='\)\)\s*\{\s*break;\s*\}/g, '// break removido para taguear tudo');

fs.writeFileSync('sync.js', code, 'utf8');
console.log('Break removido!');
