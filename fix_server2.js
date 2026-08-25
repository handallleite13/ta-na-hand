const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

code = code.replace(/res\.json\(resultados\.map\(i => \(\{\.\.\.i, titulo: traduzirTitulo\(i\.titulo\)\}\)\)\);/g, 
"res.json(resultados.map(i => ({...i, original: i.titulo, titulo: traduzirTitulo(i.titulo)})));");

fs.writeFileSync('server.js', code);
console.log('Fixed ALL res.json');
