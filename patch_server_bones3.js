const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const search = `} else if (c !== 'todas') {`;
const insert = `} else if (c === 'bones') {
           const hatsRegex = /boné|bone\\b|chapéu|chapeu|touca|gorro|viseira|cap\\b|hat\\b|beanie|snapback|bucket|帽子|棒球帽|毛线帽|渔夫帽/i;
           resultados = resultados.filter(item => {
               const orig = (item.original || item.titulo || '').toLowerCase();
               return orig.match(hatsRegex) && !orig.match(bagsRegex);
           });
        } else if (c !== 'todas') {`;

code = code.split(search).join(insert);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Patched bones before todas!');
