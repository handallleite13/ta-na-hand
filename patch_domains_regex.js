const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /if \(c\.startsWith\('esportes'\) \|\| c === 'bolsas'\) \{[\s\S]*?else \{[\s\S]*?dominiosValidos = flattenGroup\(lojas\.esportes\);\s*\}\s*\}/g;

const replacement = `if (c.startsWith('esportes') || c === 'bolsas') {
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

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed domains successfully!');
