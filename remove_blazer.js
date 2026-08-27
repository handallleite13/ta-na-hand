const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
code = code.replace(/const dressShirts = \/衬衫\|social\|dress shirt\|camisa social\|suit\|西装\|西服\|blazer\/i;/g, "const dressShirts = /衬衫|social|dress shirt|camisa social|suit|西装|西服/i;");
fs.writeFileSync('server.js', code, 'utf8');
console.log('Removed blazer from dressShirts');
