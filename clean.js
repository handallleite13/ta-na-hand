const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const search = `      // GLOBAL: Remove Equipamentos from everything except esportes_equipamentos
      if (c !== 'esportes_equipamentos') {
          resultados = resultados.filter(i => !(i.domain && i.domain.includes('pp111115555')));
      }`;

code = code.replace(search, '');
fs.writeFileSync('server.js', code, 'utf8');
console.log('Cleaned duplicate');
