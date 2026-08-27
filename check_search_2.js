const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
const searchIndex = code.indexOf("app.get('/api/search'");
const searchCode = code.substring(searchIndex + 1500, searchIndex + 3000);
console.log(searchCode);
