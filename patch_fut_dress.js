const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /resultados = resultados\.filter\(item => !\(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(allOtherSports\) && !\(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(luxuryBrands\)\);/g;

const replacement = `const dressShirts = /衬衫|social|dress shirt|camisa social|suit|西装|西服|blazer/i;
              resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(allOtherSports) && !(item.titulo || '').toLowerCase().match(luxuryBrands) && !(item.titulo || '').toLowerCase().match(dressShirts));`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Futebol dress shirts patched!');
