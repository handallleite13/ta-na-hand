const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
console.log('Index of latest:', code.indexOf("app.get('/api/latest'"));
console.log('Index of search:', code.indexOf("app.get('/api/search'"));
console.log('Index of comment:', code.indexOf("// Filtrar por Categoria igual na busca"));
console.log('Last index of comment:', code.lastIndexOf("// Filtrar por Categoria igual na busca"));
