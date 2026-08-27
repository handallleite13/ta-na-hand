const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Add outrosEsportesRegex to the sports block
const addOutrosEsportesRegex = /const allOtherSports = new RegExp[^\n]*\n/;
const outrosEsportesCode = `const allOtherSports = new RegExp(Object.values(sportKeywords).map(r => r.source).join('|'), 'i');
const outrosEsportesRegex = /nhl|hockey|冰球|afl|australian rules|tennis|网球|golf|高尔夫|badminton|羽毛球|volleyball|排球|cycling|骑行|boxing|拳击|mma|ufc/i;
const globalSportsRegex = new RegExp(teamTrainingRegex.source + '|' + outrosEsportesRegex.source, 'i');
`;
// Wait, teamTrainingRegex is defined AFTER allOtherSports. I will just define globalSportsRegex further down.

const globalRegexInsertPoint = /const teamTrainingRegex = new RegExp[^\n]*\n/;
const globalRegexCode = `const teamTrainingRegex = new RegExp('tracksuit|survetement|chandal|tuta|出场服|madrid|barcelona|psg|munich|united|city|arsenal|chelsea|liverpool|juventus|milan|inter|spurs|tottenham|ajax|boca|river plate|flamengo|corinthians|palmeiras|sao paulo|gremio|cruzeiro|atletico|vasco|fluminense|botafogo|巴黎|皇马|巴塞|拜仁|曼城|曼联|阿森纳|切尔西|利物浦|尤文|米兰|马竞|多特|国米|罗马|' + Object.values(sportKeywords).map(r => r.source).join('|'), 'i');
const outrosEsportesRegex = /nhl|hockey|冰球|afl|australian rules|tennis|网球|golf|高尔夫|badminton|羽毛球|volleyball|排球|cycling|骑行|boxing|拳击|mma|ufc/i;
const globalSportsRegex = new RegExp(teamTrainingRegex.source + '|' + outrosEsportesRegex.source, 'i');
`;
code = code.replace(globalRegexInsertPoint, globalRegexCode);


// 2. Global Isolation Logic for API Latest
const latestInjectPoint = /\/\/ --- NEW: BOLSAS CATEGORY ---/;
const globalIsolationLatest = `
        // --- GLOBAL ISOLATION FOR LUXO AND OUTROS ---
        if (c.startsWith('luxo_') || c.startsWith('outros_')) {
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              // Block Bags, Shoes, Fitness, and ALL Sports
              return !t.match(bagsRegex) && !t.match(chuteiraRegexLatest) && !t.match(fitnessRegex) && !t.match(globalSportsRegex);
           });
        }
        
        // --- NEW: ESPORTES OUTROS ---
        if (c === 'esportes_outros') {
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              // Must not match the major sports, bags, or fitness.
              return !t.match(bagsRegex) && !t.match(chuteiraRegexLatest) && !t.match(fitnessRegex) && !t.match(teamTrainingRegex) && !t.match(allOtherSports);
           });
        }

        // --- NEW: BOLSAS CATEGORY ---`;
code = code.replace(latestInjectPoint, globalIsolationLatest);


// 3. Global Isolation Logic for API Search
const searchInjectPoint = /\/\/ --- NEW: BOLSAS CATEGORY FOR SEARCH ---/;
const globalIsolationSearch = `
        // --- GLOBAL ISOLATION FOR LUXO AND OUTROS ---
        if (c && (c.startsWith('luxo_') || c.startsWith('outros_'))) {
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              return !t.match(bagsRegex) && !t.match(chuteiraRegexLatest) && !t.match(fitnessRegex) && !t.match(globalSportsRegex);
           });
        }

        // --- NEW: ESPORTES OUTROS ---
        if (c === 'esportes_outros') {
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              return !t.match(bagsRegex) && !t.match(chuteiraRegexLatest) && !t.match(fitnessRegex) && !t.match(teamTrainingRegex) && !t.match(allOtherSports);
           });
        }

        // --- NEW: BOLSAS CATEGORY FOR SEARCH ---`;
code = code.replace(searchInjectPoint, globalIsolationSearch);


fs.writeFileSync('server.js', code, 'utf8');
console.log('Global Isolation applied to server.js');
