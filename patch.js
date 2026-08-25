const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /if\s*\(\s*c\s*!==\s*'todas'\s*\)\s*\{[\s\S]*?resultados\s*=\s*resultados\.filter\(item\s*=>\s*dominiosValidos\.includes\(item\.domain\)\);\s*\}/g;

const newLogic = `if (c !== 'todas') {
      const { lojas } = require('./scraper');
      const flattenGroup = (group) => {
        let arr = [];
        for (let key in group) {
          if (Array.isArray(group[key])) arr.push(...group[key]);
          else if (typeof group[key] === 'object') arr = arr.concat(flattenGroup(group[key]));
        }
        return arr;
      };
      let dominiosValidos = [];
      if (c === 'esportes') {
        dominiosValidos = flattenGroup(lojas.esportes);
      } else if (c.startsWith('esportes_') && lojas.esportes[c.split('_')[1]]) {
        dominiosValidos = lojas.esportes[c.split('_')[1]];
      } else if (lojas[c]) {
        dominiosValidos = flattenGroup(lojas[c]);
      } else if (c.includes('_') && lojas[c.split('_')[0]]) {
        dominiosValidos = flattenGroup(lojas[c.split('_')[0]]);
      }
      dominiosValidos = dominiosValidos.map(d => d.replace(/\\/$/, ''));
      resultados = resultados.filter(item => dominiosValidos.includes(item.domain));
    }`;

code = code.replace(regex, newLogic);
fs.writeFileSync('server.js', code);
console.log('Patched server.js with exactly ' + (code.match(/c === 'esportes'/g) || []).length + ' replacements.');
