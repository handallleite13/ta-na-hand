const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /(} else if \(c === 'social'\) {[\s\S]*?return t\.match\(dressShirts\) && !t\.match\(bagsRegex\) && !isSneaker;\n\s*\})/g;

const replacement = `$1 else if (c === 'bones') {
           const hatsRegex = /boné|bone\\b|chapéu|chapeu|touca|gorro|viseira|cap\\b|hat\\b|beanie|snapback|bucket|帽子|棒球帽|毛线帽|渔夫帽/i;
           resultados = resultados.filter(item => {
               const t = (item.original || item.titulo || '').toLowerCase();
               return t.match(hatsRegex) && !t.match(bagsRegex);
           });
        }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Regex patch successful!');
