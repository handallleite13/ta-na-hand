const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /if \(!t\.match\(luxuryBrands\) \|\| t\.match\(bagsRegex\)\) return false;/g;
const replacement = `const isStrictLuxuryDomain = ['407131796', '3179704378'].some(d => item.domain && item.domain.includes(d));
                  if ((!t.match(luxuryBrands) && !isStrictLuxuryDomain) || t.match(bagsRegex)) return false;`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Server luxo strict domain patched!');
