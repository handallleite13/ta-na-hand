const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const searchIndex = code.indexOf("app.get('/api/search'");
const searchCode = code.substring(searchIndex, code.indexOf("app.get('/api/latest'"));
console.log('Search has dominiosValidos:', searchCode.includes('dominiosValidos = flattenGroup'));
