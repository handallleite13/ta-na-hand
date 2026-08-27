const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Update sportKeywords to include allOtherSports logic more robustly
const oldSportsBlockRegex = /const sportKeywords = \{[\s\S]*?const allOtherSports = new RegExp[^\n]*\n/;
const newSportsBlock = `
const bagsRegex = /bag|backpack|bolsa|mochila|mala|双肩包|单肩包|手提包|旅行包|腰包|斜挎包|书包|胸包|背包/i;

const sportKeywords = {
  basquete: /nba|lakers|bulls|celtics|warriors|heat|knicks|nets|mavericks|suns|bucks|sixers|nuggets|curry|lebron|kobe|durant|篮球|basketball|jordan/i,
  futebol_americano: /nfl|chiefs|eagles|patriots|ravens|49ers|packers|cowboys|steelers|dolphins|broncos|raiders|seahawks|buccaneers|橄榄球|super bowl/i,
  beisebol: /mlb|baseball|yankees|dodgers|red sox|braves|astros|cubs|mets|padres|phillies|rangers|棒球/i,
  automobilismo: /\\bf1\\b|formula 1|formula one|racing|ferrari|mercedes|red\\s?bull|mclaren|aston martin|porsche|bmw motorsport|amg|petronas|nascar|motogp|yamaha|车队|赛车/i,
  rugby: /rugby|sevens|all blacks?|sydney rooster|nrl|brumbies|crusaders|hurricanes/i
};
const allOtherSports = new RegExp(Object.values(sportKeywords).map(r => r.source).join('|'), 'i');
`;
code = code.replace(oldSportsBlockRegex, newSportsBlock);

// Replace fitness regex in BOTH places
const oldFitnessFilter = /if \(c === 'fitness'\) \{[\s\S]*?resultados = resultados\.filter\(item => \{[\s\S]*?const t = \(item\.titulo \|\| ''\)\.toLowerCase\(\);[\s\S]*?return t\.match\(fitnessRegex\) && !t\.match\(teamTrainingRegex\);[\s\S]*?\}\);[\s\S]*?\}/g;

const newFitnessFilter = `if (c === 'fitness') {
           const fitnessRegex = /yoga|lululemon|gymshark|alo yoga|nike pro|under armour|fitness|健身|瑜伽|紧身|速干|running|jogger|sweatpants|legging|training|卫衣|卫裤|外套|休闲|运动|套装|圆领|背心|夹克|长裤|短裤/i;
           const teamTrainingRegex = /tracksuit|survetement|chandal|tuta|出场服|nba|nfl|mlb|f1|racing|ferrari|mercedes|red\\s?bull|mclaren|porsche|rugby|all black|库里|飞人|男篮|madrid|barcelona|psg|munich|united|city|arsenal|chelsea|liverpool|juventus|milan|inter|spurs|tottenham|ajax|boca|river plate|flamengo|corinthians|palmeiras|sao paulo|gremio|cruzeiro|atletico|vasco|fluminense|botafogo|巴黎|皇马|巴塞|拜仁|曼城|曼联|阿森纳|切尔西|利物浦|尤文|米兰|马竞|多特|国米|罗马/i;
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              return t.match(fitnessRegex) && !t.match(teamTrainingRegex) && !t.match(bagsRegex);
           });
        }`;

code = code.replace(oldFitnessFilter, newFitnessFilter);

// Inject Bolsas logic into /api/latest
const dominiosRegexLatest = /if \(c\.startsWith\('esportes'\) \|\| c === 'fitness'\) \{/;
const dominiosReplacementLatest = `if (c.startsWith('esportes') || c === 'fitness' || c === 'bolsas') {`;
code = code.replace(dominiosRegexLatest, dominiosReplacementLatest);

const latestFilterInjectPoint = /if \(c\.startsWith\('esportes_'\)\) \{/;
const bolsasLatestLogic = `
        // --- NEW: BOLSAS CATEGORY ---
        if (c === 'bolsas') {
           resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(bagsRegex));
        } else if (c !== 'todas') {
           // Exclude bags from all other categories globally
           resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(bagsRegex));
        }

        if (c.startsWith('esportes_')) {`;
code = code.replace(latestFilterInjectPoint, bolsasLatestLogic);

// Inject Bolsas logic into /api/search
const targetRegexSearch = /if \(\(parts\[0\] === 'esportes' \|\| parts\[0\] === 'fitness'\) && lojas\.esportes\) \{/;
const targetReplacementSearch = `if ((parts[0] === 'esportes' || parts[0] === 'fitness' || parts[0] === 'bolsas') && lojas.esportes) {`;
code = code.replace(targetRegexSearch, targetReplacementSearch);

const searchFilterInjectPoint = /if \(c && c\.startsWith\('esportes_'\)\) \{/;
const bolsasSearchLogic = `
        // --- NEW: BOLSAS CATEGORY FOR SEARCH ---
        if (c === 'bolsas') {
           resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(bagsRegex));
        } else if (c !== 'todas') {
           resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(bagsRegex));
        }

        if (c && c.startsWith('esportes_')) {`;
code = code.replace(searchFilterInjectPoint, bolsasSearchLogic);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Server patched for expanded fitness and new Bolsas category!');
