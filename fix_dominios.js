const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const replacement = `let dominiosValidos = [];
      if (c.startsWith('esportes') || c === 'bolsas') {
        dominiosValidos = flattenGroup(lojas.esportes);
      } else if (c.startsWith('fitness')) {
        dominiosValidos = flattenGroup(lojas); // Fitness scans all domains!
      } else if (lojas[c]) {
        dominiosValidos = flattenGroup(lojas[c]);
      } else if (c.includes('_') && lojas[c.split('_')[0]]) {
        dominiosValidos = flattenGroup(lojas[c.split('_')[0]]);
      }
      dominiosValidos = dominiosValidos.map`;

code = code.replace(/let dominiosValidos = \[\];[\s\S]*?dominiosValidos = dominiosValidos\.map/, replacement);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed dominiosValidos for fitness!');
