const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /resultados = resultados\.filter\(item => !\(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(allOtherSports\)\);/g;
const replacement = `const luxuryBrands = /gucci|prada|louis vuitton|\\blv\\b|balenciaga|dior|burberry|versace|fendi|amiri|givenchy|chanel|hermes|rolex|古驰|普拉达|路易威登|巴黎世家|迪奥|博柏利|范思哲|芬迪/i;
              resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(allOtherSports) && !(item.titulo || '').toLowerCase().match(luxuryBrands));`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Futebol luxury leak fixed!');
