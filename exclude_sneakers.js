const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /resultados = resultados\.filter\(item => \(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(dressShirts\) && !\(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(bagsRegex\)\);/g;
const replacement = `resultados = resultados.filter(item => {
               const t = (item.titulo || '').toLowerCase();
               const isSneaker = t.match(/sneaker|shoe|tenis|tênis|dunk|jordan|force|skool|sapatilha|boot|鞋/i);
               return t.match(dressShirts) && !t.match(bagsRegex) && !isSneaker;
           });`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Excluded sneakers from social');
