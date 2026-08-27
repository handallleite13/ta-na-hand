const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex1 = /else if \(c === 'luxo' \|\| c\.startsWith\('luxo_'\) \|\| c === 'social'\)/g;
const replacement1 = `else if (c === 'luxo' || c.startsWith('luxo_') || c === 'social' || c === 'bones')`;
code = code.replace(regex1, replacement1);

const searchString = `           resultados = resultados.filter(item => {
               const orig = (item.original || item.titulo || '').toLowerCase();
               const isSneaker = orig.match(/sneaker|shoe|tenis|tênis|dunk|jordan|force|skool|sapatilha|boot|鞋/i);
               return orig.match(dressShirts) && !orig.match(bagsRegex) && !isSneaker;
           });
        }`;

const replacementString = `           resultados = resultados.filter(item => {
               const orig = (item.original || item.titulo || '').toLowerCase();
               const isSneaker = orig.match(/sneaker|shoe|tenis|tênis|dunk|jordan|force|skool|sapatilha|boot|鞋/i);
               return orig.match(dressShirts) && !orig.match(bagsRegex) && !isSneaker;
           });
        } else if (c === 'bones') {
           const hatsRegex = /boné|bone\\b|chapéu|chapeu|touca|gorro|viseira|cap\\b|hat\\b|beanie|snapback|bucket|帽子|棒球帽|毛线帽|渔夫帽/i;
           resultados = resultados.filter(item => {
               const orig = (item.original || item.titulo || '').toLowerCase();
               return orig.match(hatsRegex) && !orig.match(bagsRegex);
           });
        }`;

code = code.split(searchString).join(replacementString);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Server patched with bones via split/join!');
