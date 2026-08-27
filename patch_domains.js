const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const target = `      if (c.startsWith('esportes') || c === 'bolsas') {
        if (c === 'esportes_outros') {
            const { futebol, basquete, ...rest } = lojas.esportes;
            dominiosValidos = flattenGroup(rest); // Prevent pure football/basketball from flooding Outros
        } else {
            dominiosValidos = flattenGroup(lojas.esportes);
        }
      }`;

const replacement = `      if (c.startsWith('esportes') || c === 'bolsas') {
        if (c === 'esportes_outros') {
            const { futebol, basquete, ...rest } = lojas.esportes;
            dominiosValidos = flattenGroup(rest);
        } else if (c === 'esportes' || c === 'esportes_geral' || c === 'bolsas') {
            dominiosValidos = flattenGroup(c === 'bolsas' ? lojas.bolsas || lojas : lojas.esportes);
        } else {
            const sub = c.replace('esportes_', '');
            dominiosValidos = flattenGroup(lojas.esportes[sub] || lojas.esportes);
        }
      }`;

code = code.replace(target, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed domains');
