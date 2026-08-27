const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const searchIndex = code.indexOf("app.get('/api/search'");
console.log(code.substring(0, searchIndex));
