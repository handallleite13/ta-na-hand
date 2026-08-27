const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Make 'fitness' use all domains instead of just esportes in BOTH latest and search endpoints
// Search API
const searchLogic = `if (c === 'todas' || !c || c.startsWith('fitness')) {
       // Search everywhere for fitness so we can pull from 'outros' and 'luxo'
       dominiosValidos = flattenGroup(lojas);
    } else {`;
code = code.replace(/if \(c === 'todas' \|\| !c\) \{\s*dominiosValidos = flattenGroup\(lojas\);\s*\} else \{/, searchLogic);
code = code.replace(/if \(\(parts\[0\] === 'esportes' \|\| parts\[0\] === 'fitness' \|\| parts\[0\] === 'bolsas'\) && lojas\.esportes\)/g, "if ((parts[0] === 'esportes' || parts[0] === 'bolsas') && lojas.esportes)");

// Latest API
const latestLogic = `if (c === 'todas' || !c || c.startsWith('fitness')) {
          dominiosValidos = flattenGroup(lojas);
        } else {`;
code = code.replace(/if \(!c \|\| c === 'todas'\) \{\s*dominiosValidos = flattenGroup\(lojas\);\s*\} else \{/, latestLogic);
code = code.replace(/if \(c\.startsWith\('esportes'\) \|\| c\.startsWith\('fitness'\) \|\| c === 'bolsas'\)/g, "if (c.startsWith('esportes') || c === 'bolsas')");


// 2. Add blocked sports domains to fitness filter
const fitnessFilterTarget = /if \(!t\.match\(fitnessRegex\) \|\| t\.match\(teamTrainingRegex\) \|\| t\.match\(bagsRegex\)\) \{\s*return false;\s*\}/g;
const fitnessFilterReplacement = `
              // BLINDAGEM: Block domains that are strictly team sports so their generic 'Shorts' and 'Regatas' don't leak into Fitness
              const blockedSportsDomains = ['chenzhefuzhuang', 'xingkong-sports', 'football-all', 'qiumishijie', '8618320710438', 'changjiangsports', 'dongshanstore', 'feitengsports', '007007haoyuntiyu', '1215795243', '3179704378', 'yiyisports2016'];
              if (item.domain && blockedSportsDomains.some(d => item.domain.includes(d))) return false;

              // Base exclusion
              if (!t.match(fitnessRegex) || t.match(teamTrainingRegex) || t.match(bagsRegex)) {
                  return false;
              }`;
code = code.replace(fitnessFilterTarget, fitnessFilterReplacement);

// 3. Add base layer keywords to fitnessRegex and compressaoRegex
const fitnessRegexTarget = /const fitnessRegex = new RegExp\('fitness\|academia/;
code = code.replace(fitnessRegexTarget, "const fitnessRegex = new RegExp('fitness|academia|segunda pele|compress|紧身|速干|打底|");

// Update the subcategory regex for compressao to include 打底 (base layer)
code = code.replace(/segunda pele\|compress\|紧身\|pro\|under armour/g, 'segunda pele|compress|紧身|速干|打底|pro|under armour');

fs.writeFileSync('server.js', code, 'utf8');
console.log('Patched server.js for fitness blindagem!');
