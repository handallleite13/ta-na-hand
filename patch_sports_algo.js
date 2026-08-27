const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const sportsKeywordsBlock = `
const sportKeywords = {
  basquete: /nba|lakers|bulls|celtics|warriors|heat|knicks|nets|mavericks|suns|bucks|sixers|nuggets|curry|lebron|kobe|durant|篮球|basketball/i,
  futebol_americano: /nfl|chiefs|eagles|patriots|ravens|49ers|packers|cowboys|steelers|dolphins|broncos|raiders|seahawks|buccaneers|橄榄球|super bowl/i,
  beisebol: /mlb|baseball|yankees|dodgers|red sox|braves|astros|cubs|mets|padres|phillies|rangers|棒球/i,
  automobilismo: /\\bf1\\b|formula 1|formula one|racing|ferrari|mercedes|red\\s?bull|mclaren|aston martin|porsche|bmw motorsport|amg|petronas|nascar|motogp|yamaha|车队|赛车/i,
  rugby: /rugby|sevens|all blacks?|sydney rooster|nrl|brumbies|crusaders|hurricanes/i
};
const allOtherSports = new RegExp(Object.values(sportKeywords).map(r => r.source).join('|'), 'i');
`;

if (!code.includes('const sportKeywords = {')) {
  code = code.replace(/const express = require\('express'\);/, "const express = require('express');\n" + sportsKeywordsBlock);
}

// 1. PATCH /api/latest Filtering
const latestFilterRegex = /if \(c === 'esportes'\) \{[\s\S]*?dominiosValidos = flattenGroup\(lojas\[c\.split\('_'\)\[0\]\]\);\s*\}/;
const latestFilterReplacement = `if (c.startsWith('esportes')) {
          dominiosValidos = flattenGroup(lojas.esportes);
        } else if (lojas[c]) {
          dominiosValidos = flattenGroup(lojas[c]);
        } else if (c.includes('_') && lojas[c.split('_')[0]]) {
          dominiosValidos = flattenGroup(lojas[c.split('_')[0]]);
        }`;

code = code.replace(latestFilterRegex, latestFilterReplacement);

// 1.1 Add sports keyword filtering in /api/latest
const latestCalcadosEnd = /\} else if \(c === 'calcados_casuais'\) \{[\s\S]*?resultados = resultados\.filter\(item => !\(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(chuteiraRegexLatest\)\);\s*\}/;
const latestSportsFilter = `} else if (c === 'calcados_casuais') {
           resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(chuteiraRegexLatest));
        }

        // --- NEW: ESPORTES KEYWORD FILTERING ---
        if (c.startsWith('esportes_')) {
           const sub = c.replace('esportes_', '');
           if (sportKeywords[sub]) {
              resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(sportKeywords[sub]));
           } else if (sub === 'futebol') {
              // Exclude all other sports to keep football clean
              resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(allOtherSports));
           }
        }`;

code = code.replace(latestCalcadosEnd, latestSportsFilter);


// 2. PATCH /api/search Filtering
const searchTargetRegex = /if \(parts\.length === 1 && lojas\[parts\[0\]\]\) \{[\s\S]*?targetDomains = lojas\[parts\[0\]\]\[parts\[1\]\];\s*\}/;
const searchTargetReplacement = `if (parts[0] === 'esportes' && lojas.esportes) {
                // Ignore domain-based subcategories for esportes, use ALL esportes domains
                targetDomains = flattenGroup(lojas.esportes);
             } else if (parts.length === 1 && lojas[parts[0]]) {
                targetDomains = flattenGroup(lojas[parts[0]]);
             } else if (parts.length === 2 && lojas[parts[0]] && lojas[parts[0]][parts[1]]) {
                targetDomains = lojas[parts[0]][parts[1]];
             }`;

code = code.replace(searchTargetRegex, searchTargetReplacement);


// 2.1 Add sports keyword filtering to the results in /api/search AFTER getting the global search results
const searchShoeRegex = /} else if \(c !== 'todas'\) \{[\s\S]*?resultados = resultados\.filter\(item => \{[\s\S]*?return !shoeDomains\.some\(sd => \(item\.domain \|\| item\.link \|\| ''\)\.includes\(sd\)\);[\s\S]*?\}\);[\s\S]*?\}/;
const searchSportsStrictFilter = `} else if (c !== 'todas') {
           resultados = resultados.filter(item => {
              return !shoeDomains.some(sd => (item.domain || item.link || '').includes(sd));
           });
        }
        
        // --- NEW: ESPORTES STRICT KEYWORD FILTERING FOR SEARCH ---
        if (c && c.startsWith('esportes_')) {
           const sub = c.replace('esportes_', '');
           if (sportKeywords[sub]) {
              // Only keep items matching the specific sport keyword
              resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(sportKeywords[sub]));
           } else if (sub === 'futebol') {
              // Exclude other sports
              resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(allOtherSports));
           }
        }`;

code = code.replace(searchShoeRegex, searchSportsStrictFilter);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Advanced Algorithmic Sports Filter applied!');
