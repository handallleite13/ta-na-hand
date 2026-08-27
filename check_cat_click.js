const fs = require('fs');
const code = fs.readFileSync('public/index.html', 'utf8');
const start = code.indexOf("document.querySelectorAll('#category-menu a').forEach");
console.log(code.substring(start, start + 300));
