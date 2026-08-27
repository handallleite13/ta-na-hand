const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex1 = /\} else if \(c === 'luxo' \|\| c\.startsWith\('luxo_'\)\) \{/g;
const replacement1 = `} else if (c === 'luxo' || c.startsWith('luxo_') || c === 'social') {`;
code = code.replace(regex1, replacement1);

const regex2 = /\} else if \(c !== 'todas'\) \{\s+\/\/ Exclude bags from all other categories globally\s+resultados = resultados\.filter\(item => !\(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(bagsRegex\)\);\s+\}/g;
const replacement2 = `} else if (c === 'social') {
           const dressShirts = /衬衫|social|dress shirt|camisa social|suit|西装|西服|blazer/i;
           resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(dressShirts) && !(item.titulo || '').toLowerCase().match(bagsRegex));
        } else if (c !== 'todas') {
           // Exclude bags from all other categories globally
           resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(bagsRegex));
        }`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Social category backend patched!');
