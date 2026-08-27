const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const filterRegex = /resultados = resultados\.filter\(item => \{[\s\S]*?return variants\.some\(v => titulo\.includes\(v\.replace\(\/_\/g, ' '\)\)\);\s*\}\);\s*\}\);/;

const newFilter = `resultados = resultados.filter(item => {
          const titulo = (item.titulo || '').toLowerCase();
          
          // Se a pesquisa for pelo time "All Blacks", barra itens que não sejam de Rugby ou Nova Zelândia
          if (query.includes('all blacks')) {
            const isRugbyDomain = (item.domain || item.link || '').includes('yiyisports2016');
            const hasZealand = titulo.includes('zealand') || titulo.includes('新西兰');
            if (!isRugbyDomain && !hasZealand) return false;
          }
          
          return translatedKeywords.every(variants => {
            return variants.some(v => titulo.includes(v.replace(/_/g, ' ')));
          });
        });`;

code = code.replace(filterRegex, newFilter);
fs.writeFileSync('server.js', code, 'utf8');
console.log('All Blacks strict heuristic patched!');
