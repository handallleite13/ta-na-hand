const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const searchIndex = code.indexOf("app.get('/api/search'");
const searchCode = code.substring(searchIndex);
const start = searchCode.indexOf("if (c && c.startsWith('esportes_')) {");
if (start !== -1) {
    console.log(searchCode.substring(start, start + 500));
} else {
    console.log('esportes_ block not found in /api/search!');
}
