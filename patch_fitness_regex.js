const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const oldRegex = /const teamTrainingRegex = \/tracksuit.*?\/i;/g;
const newRegex = "const teamTrainingRegex = new RegExp('tracksuit|survetement|chandal|tuta|出场服|madrid|barcelona|psg|munich|united|city|arsenal|chelsea|liverpool|juventus|milan|inter|spurs|tottenham|ajax|boca|river plate|flamengo|corinthians|palmeiras|sao paulo|gremio|cruzeiro|atletico|vasco|fluminense|botafogo|巴黎|皇马|巴塞|拜仁|曼城|曼联|阿森纳|切尔西|利物浦|尤文|米兰|马竞|多特|国米|罗马|' + Object.values(sportKeywords).map(r => r.source).join('|'), 'i');";

code = code.replace(oldRegex, newRegex);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed teamTrainingRegex!');
