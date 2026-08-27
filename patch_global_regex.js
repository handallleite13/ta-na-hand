const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regexesDef = `
const outrosEsportesRegex = /nhl|hockey|冰球|afl|australian rules|tennis|网球|golf|高尔夫|badminton|羽毛球|volleyball|排球|cycling|骑行|boxing|拳击|mma|ufc/i;
const globalSportsRegex = new RegExp(teamTrainingRegex.source + '|' + outrosEsportesRegex.source, 'i');
`;

code = code.replace(/const teamTrainingRegex = new RegExp\([^;]+;\n/m, (match) => match + regexesDef);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Inserted globalSportsRegex correctly!');
