const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
const searchIndex = code.indexOf("app.get('/api/search'");
const searchCode = code.substring(searchIndex, searchIndex + 1500);
console.log(searchCode);
