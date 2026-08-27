const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

code = code.replace(/const dressShirts = \/衬衫\|social\|dress shirt\|camisa social\|suit\|西装\|西服\/i;/g, "const dressShirts = /衬衫|social|dress shirt|camisa social|terno|alfaiataria|formal suit|business suit|西装|西服/i;");

fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed dressShirts regex globally.');
