const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const searchQ = `        q = q.replace(/reino unido/g, 'united_kingdom');`;
const replaceQ = `        q = q.replace(/reino unido/g, 'united_kingdom');\n        q = q.replace(/meia calça/g, 'meia_calça');\n        q = q.replace(/meia calca/g, 'meia_calça');`;
code = code.replace(searchQ, replaceQ);

const searchSynonyms = `'roupão': ['bathrobe', '浴袍'],\n          'roupao': ['bathrobe', '浴袍'],`;
const replaceSynonyms = `'roupão': ['bathrobe', '浴袍'],\n          'roupao': ['bathrobe', '浴袍'],
          'meia_calça': ['tights', 'pantyhose', 'leggings', '连裤袜', '裤袜', '丝袜', 'meia-calça', 'meia-calca'],
          'vestido': ['dress', '连衣裙', '裙子', '裙'],
          'saia': ['skirt', '半身裙', '短裙', '长裙'],`;
code = code.replace(searchSynonyms, replaceSynonyms);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Search synonyms added!');
