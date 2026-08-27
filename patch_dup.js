const fs = require('fs');
let code = fs.readFileSync('sync.js', 'utf8');

const searchFind = `const existing = catalogo.find(i => i.link === item.link);`;
const replaceFind = `const existing = catalogo.find(i => i.link.split('&')[0] === item.link.split('&')[0]);`;

code = code.replace(searchFind, replaceFind);

fs.writeFileSync('sync.js', code, 'utf8');
console.log('Fixed duplication bug in sync.js!');
