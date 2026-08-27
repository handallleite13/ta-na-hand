const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const search = `const hatsRegex = /boné|bone\\b|chapéu|chapeu|touca|gorro|viseira|cap\\b|hat\\b|beanie|snapback|bucket|帽子|棒球帽|毛线帽|渔夫帽/i;
           resultados = resultados.filter(item => {
               const orig = (item.original || item.titulo || '').toLowerCase();
               return orig.match(hatsRegex) && !orig.match(bagsRegex);
           });`;

const replace = `const hatsRegex = /boné|\\bbone\\b|chapéu|chapeu|touca|gorro|viseira|\\bcap\\b|\\bhat\\b|beanie|snapback|bucket|帽子|棒球帽|毛线帽|渔夫帽/i;
           resultados = resultados.filter(item => {
               const orig = (item.original || item.titulo || '').toLowerCase();
               const isSneaker = orig.match(/sneaker|shoe|tenis|tênis|dunk|jordan|force|skool|sapatilha|boot|鞋/i);
               return orig.match(hatsRegex) && !orig.match(bagsRegex) && !isSneaker;
           });`;

code = code.split(search).join(replace);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed hats regex!');
