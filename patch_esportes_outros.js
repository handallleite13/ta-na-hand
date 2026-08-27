const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /if \(c\.startsWith\('esportes'\) \|\| c === 'bolsas'\) \{\s+dominiosValidos = flattenGroup\(lojas\.esportes\);\s+\} else if \(c\.startsWith\('fitness'\)\) \{/;
const replacement = `if (c.startsWith('esportes') || c === 'bolsas') {
        if (c === 'esportes_outros') {
            const { futebol, basquete, ...rest } = lojas.esportes;
            dominiosValidos = flattenGroup(rest); // Prevent pure football/basketball from flooding Outros
        } else {
            dominiosValidos = flattenGroup(lojas.esportes);
        }
      } else if (c.startsWith('fitness')) {`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed dominios for esportes_outros!');
