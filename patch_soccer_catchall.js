const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regexDef = `const teamTrainingRegex = new RegExp('tracksuit|survetement|chandal|tuta|出场服|主场|客场|球衣|足球|泰版|球迷版|球员版|法国|阿根廷|巴西|英格兰|葡萄牙|西班牙|意大利|德国|荷兰|madrid|barcelona|psg|munich|united|city|arsenal|chelsea|liverpool|juventus|milan|inter|spurs|tottenham|ajax|boca|river plate|flamengo|corinthians|palmeiras|sao paulo|gremio|cruzeiro|atletico|vasco|fluminense|botafogo|巴黎|皇马|巴塞|巴萨|拜仁|曼城|曼联|阿森纳|切尔西|利物浦|尤文|米兰|马竞|多特|国米|罗马|' + Object.values(sportKeywords).map(r => r.source).join('|'), 'i');`;

code = code.replace(/const teamTrainingRegex = new RegExp[^\n]*\n/, regexDef + '\n');
fs.writeFileSync('server.js', code, 'utf8');
console.log('Added catch-all soccer words to teamTrainingRegex!');
