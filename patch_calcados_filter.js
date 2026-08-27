const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regexFilter = /resultados = resultados\.filter\(item => dominiosValidos\.includes\(item\.domain\)\);/g;
const replacement = `resultados = resultados.filter(item => dominiosValidos.includes(item.domain));
      if (c === 'calcados_chuteiras') {
         resultados = resultados.filter(item => {
            const t = (item.titulo || '').toLowerCase();
            return t.match(/fg|tf|ag|sg|ic|in|chuteira|足球鞋|football/);
         });
      } else if (c === 'calcados_casuais') {
         resultados = resultados.filter(item => {
            const t = (item.titulo || '').toLowerCase();
            return !t.match(/fg|tf|ag|sg|ic|in|chuteira|足球鞋|football/);
         });
      }`;

code = code.replace(regexFilter, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Keyword filters added for calcados subcategories!');
