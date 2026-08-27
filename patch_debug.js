const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
code = code.replace('translatedKeywords.push(kwVariants);', 'translatedKeywords.push(kwVariants); console.log("QUERY:", query, "VARIANTS:", kwVariants);');
fs.writeFileSync('server_debug.js', code, 'utf8');
