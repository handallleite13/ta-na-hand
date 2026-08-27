const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const searchSynonyms = /'roupão': \['bathrobe', '浴袍'\],\r?\n\s*'roupao': \['bathrobe', '浴袍'\],/;
const replaceSynonyms = `'roupão': ['bathrobe', '浴袍'],\n          'roupao': ['bathrobe', '浴袍'],
          'meia_calça': ['tights', 'pantyhose', 'leggings', '连裤袜', '裤袜', '丝袜', 'meia-calça', 'meia-calca'],
          'vestido': ['dress', '连衣裙', '裙子', '裙'],
          'saia': ['skirt', '半身裙', '短裙', '长裙'],`;

if (code.match(searchSynonyms)) {
    code = code.replace(searchSynonyms, replaceSynonyms);
    fs.writeFileSync('server.js', code, 'utf8');
    console.log('Synonyms added successfully!');
} else {
    console.log('Failed to find synonyms block');
}
