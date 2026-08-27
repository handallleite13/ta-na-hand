const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /if \(sub === 'beisebol' && t\.match\(\/nhl\|new york rangers\|hockey\|ice hockey\|冰球\/i\)\) return false;/g;
const replacement = `if (sub === 'beisebol' && t.match(/nhl|new york rangers|hockey|ice hockey|冰球/i)) return false;
                 if (sub === 'automobilismo' && t.match(/92赛车|法国92|racing 92|92 titular|92 reserva/i)) return false;`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Automobilismo Rugby leak fixed!');
