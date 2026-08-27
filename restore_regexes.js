const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regexesDef = `
const teamTrainingRegex = new RegExp('tracksuit|survetement|chandal|tuta|出场服|madrid|barcelona|psg|munich|united|city|arsenal|chelsea|liverpool|juventus|milan|inter|spurs|tottenham|ajax|boca|river plate|flamengo|corinthians|palmeiras|sao paulo|gremio|cruzeiro|atletico|vasco|fluminense|botafogo|巴黎|皇马|巴塞|拜仁|曼城|曼联|阿森纳|切尔西|利物浦|尤文|米兰|马竞|多特|国米|罗马|' + Object.values(sportKeywords).map(r => r.source).join('|'), 'i');
const outrosEsportesRegex = /nhl|hockey|冰球|afl|australian rules|tennis|网球|golf|高尔夫|badminton|羽毛球|volleyball|排球|cycling|骑行|boxing|拳击|mma|ufc/i;
const globalSportsRegex = new RegExp(teamTrainingRegex.source + '|' + outrosEsportesRegex.source, 'i');
`;

code = code.replace(/const fitnessRegex = [^\n]*\n/, (match) => match + regexesDef);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Restored teamTrainingRegex and globalSportsRegex!');
