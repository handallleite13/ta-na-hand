const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Add Cache-Control to prevent CDN from serving stale results
code = code.replace(/res\.json\(/g, "res.setHeader('Cache-Control', 'no-store');\n    res.json(");

// 2. Fix Futebol Americano (Remove Panther and Cowboy)
code = code.replace(/黑豹\|/g, ''); // Remove Panther
code = code.replace(/牛仔\|/g, ''); // Remove Cowboy

// 3. Fix Beisebol and Outros (Add negative filters in the api/latest block)
// Let's modify the filter logic directly inside the server.js api blocks

// For esportes_outros:
const outrosRegex = /if \(c === 'esportes_outros'\) \{\s+resultados = resultados\.filter\(item => \{\s+const t = \(item\.titulo \|\| ''\)\.toLowerCase\(\);\s+\/\/ Must not match the major sports, bags, or fitness\.\s+return !t\.match\(bagsRegex\) && !t\.match\(chuteiraRegex\) && !t\.match\(fitnessRegex\) && !t\.match\(teamTrainingRegex\) && !t\.match\(allOtherSports\);\s+\}\);\s+\}/;

const outrosReplacement = `if (c === 'esportes_outros') {
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              // Prevent generic football/soccer jerseys from flooding Outros
              const genericFootballRegex = /\\b\\d{2}-\\d{2}\\b|home|away|third|player|fans|treino|regata|soccer|futebol|football|足球/i;
              // Must not match the major sports, bags, fitness, or generic football.
              return !t.match(bagsRegex) && !t.match(chuteiraRegex) && !t.match(fitnessRegex) && !t.match(teamTrainingRegex) && !t.match(allOtherSports) && !t.match(genericFootballRegex);
           });
        }`;

code = code.replace(outrosRegex, outrosReplacement);

// For Beisebol exclusion (Block NHL):
const beisebolTarget = `resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(sportKeywords[sub]));`;
const beisebolReplacement = `resultados = resultados.filter(item => {
                 let t = (item.titulo || '').toLowerCase();
                 if (sub === 'beisebol' && t.match(/nhl|new york rangers|hockey|ice hockey|冰球/i)) return false;
                 return t.match(sportKeywords[sub]);
              });`;

code = code.replace(beisebolTarget, beisebolReplacement);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Applied final comprehensive fixes to server.js');
