const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /if \(c === 'calcados_chuteiras'\) \{\s+resultados = resultados\.filter\(item => \(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(chuteiraRegex\)\);\s+\}/g;
const replacement = `if (c === 'calcados_chuteiras') {
         resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(chuteiraRegex) && !(item.titulo || '').toLowerCase().match(/meia|meião|sock|leg guard|shin guard|护腿板|袜子/));
      }`;
      
code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Chuteiras patched!');
