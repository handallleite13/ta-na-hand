const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Fix esportes_outros dominios
const dominiosTarget = `      if (c.startsWith('esportes') || c === 'bolsas') {
        dominiosValidos = flattenGroup(lojas.esportes);
      } else if (c.startsWith('fitness')) {`;
const dominiosReplacement = `      if (c.startsWith('esportes') || c === 'bolsas') {
        if (c === 'esportes_outros') {
            const { futebol, basquete, ...rest } = lojas.esportes;
            dominiosValidos = flattenGroup(rest); // Prevent pure football/basketball from flooding Outros
        } else {
            dominiosValidos = flattenGroup(lojas.esportes);
        }
      } else if (c.startsWith('fitness')) {`;
code = code.replace(dominiosTarget, dominiosReplacement);

// 2. Block sports brands from Luxo
const luxoTarget = `        // --- GLOBAL ISOLATION FOR LUXO AND OUTROS ---
        if (c.startsWith('luxo_') || c.startsWith('outros_')) {
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              // Block Bags, Shoes, Fitness, and ALL Sports
              return !t.match(bagsRegex) && !t.match(chuteiraRegex) && !t.match(fitnessRegex) && !t.match(globalSportsRegex);
           });
        }`;
const luxoReplacement = `        // --- GLOBAL ISOLATION FOR LUXO AND OUTROS ---
        if (c.startsWith('luxo_') || c.startsWith('outros_')) {
           const sportsBrandsRegex = /nike|adidas|puma|converse|air jordan|jordan|vans|under armour|new balance|reebok|asics|fila|kappa/i;
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              // Block Bags, Shoes, Fitness, and ALL Sports
              return !t.match(bagsRegex) && !t.match(chuteiraRegex) && !t.match(fitnessRegex) && !t.match(globalSportsRegex) && !t.match(sportsBrandsRegex);
           });
        }`;
code = code.replace(luxoTarget, luxoReplacement);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Patched dominios for esportes_outros and blocked sports brands from Luxo/Outros!');
