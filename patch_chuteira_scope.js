const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const chuteiraRegexDef = `const chuteiraRegex = /fg|tf|ag|sg|mg|ic|in|cleat|chuteira|足球鞋|橄榄球鞋|football|mercurial|predator|f50|phantom|tiempo|copa|future|superfly|vapor/i;`;

code = code.replace(/const chuteiraRegexLatest = [^\n]*\n/, '');
code = code.replace(/const bagsRegex = [^\n]*\n/, (match) => match + chuteiraRegexDef + '\n');
code = code.replace(/chuteiraRegexLatest/g, 'chuteiraRegex');

fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed chuteiraRegex scope!');
