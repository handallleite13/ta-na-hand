const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Add 'fitness' to dominiosValidos logic (which appears in API latest)
const dominiosRegexLatest = /if \(c\.startsWith\('esportes'\)\) \{[\s\S]*?dominiosValidos = flattenGroup\(lojas\.esportes\);\s*\}/;
const dominiosReplacementLatest = `if (c.startsWith('esportes') || c === 'fitness') {
          dominiosValidos = flattenGroup(lojas.esportes);
        }`;
code = code.replace(dominiosRegexLatest, dominiosReplacementLatest);

// 2. Add 'fitness' to targetDomains logic (API search)
const targetRegexSearch = /if \(parts\[0\] === 'esportes' && lojas\.esportes\) \{[\s\S]*?targetDomains = flattenGroup\(lojas\.esportes\);\s*\}/;
const targetReplacementSearch = `if ((parts[0] === 'esportes' || parts[0] === 'fitness') && lojas.esportes) {
                targetDomains = flattenGroup(lojas.esportes);
             }`;
code = code.replace(targetRegexSearch, targetReplacementSearch);

// 3. Add the fitness regex filtering logic to both endpoints
const fitnessFilterCode = `
        // --- NEW: FITNESS CATEGORY ---
        if (c === 'fitness') {
           const fitnessRegex = /yoga|lululemon|gymshark|alo yoga|nike pro|under armour|fitness|健身|瑜伽|紧身/i;
           const teamTrainingRegex = /tracksuit|survetement|chandal|tuta|训练|套装|出场服|nba|nfl|mlb|f1|racing|ferrari|mercedes|red\\s?bull|mclaren|porsche|rugby|all black|库里|飞人|男篮/i;
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              return t.match(fitnessRegex) && !t.match(teamTrainingRegex);
           });
        }
`;

// Insert into /api/latest (after the esportes keyword filtering)
const latestInjectPoint = /resultados = resultados\.filter\(item => !\(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(allOtherSports\)\);\s*\}\s*\}/;
code = code.replace(latestInjectPoint, (match) => match + fitnessFilterCode);

// Insert into /api/search (after the search sports strict filtering)
const searchInjectPoint = /resultados = resultados\.filter\(item => !\(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(allOtherSports\)\);\s*\}\s*\}/g;
let replacedSearch = false;
code = code.replace(searchInjectPoint, (match) => {
    if (!replacedSearch) {
        replacedSearch = true;
        return match + fitnessFilterCode;
    }
    return match;
});

fs.writeFileSync('server.js', code, 'utf8');
console.log('Server patched with Fitness category logic!');
