const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const searchLatest = '// GLOBAL: Remove Size Charts';
const replaceLatest = `// GLOBAL: Isolate Equipamentos
      if (c !== 'esportes_equipamentos') {
          resultados = resultados.filter(item => !(item.domain && item.domain.includes('pp111115555')));
      }
      
      // GLOBAL: Remove Size Charts`;

code = code.replace(searchLatest, replaceLatest);

const searchSearch = '// --- GLOBAL ISOLATION FOR LUXO AND OUTROS ---';
const replaceSearch = `// GLOBAL: Isolate Equipamentos
        if (c && c !== 'esportes_equipamentos') {
            resultados = resultados.filter(item => !(item.domain && item.domain.includes('pp111115555')));
        }
        
        // --- GLOBAL ISOLATION FOR LUXO AND OUTROS ---`;

code = code.replace(searchSearch, replaceSearch);

fs.writeFileSync('server.js', code, 'utf8');
console.log('server.js fully patched for equipments isolation!');
