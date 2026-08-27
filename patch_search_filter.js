const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regexFilter = /return translatedKeywords\.every\(variants => \{\s*return variants\.some\(v => titulo\.includes\(v\.replace\(\/_\/g, ' '\)\)\);\s*\}\);/g;

const replaceFilter = `return translatedKeywords.every(variants => {
            return variants.some(v => {
              const term = v.replace(/_/g, ' ');
              if (/^[a-z ]+$/i.test(term)) {
                return new RegExp('\\\\b' + term + '\\\\b', 'i').test(titulo);
              }
              return titulo.includes(term);
            });
          });`;

if (code.match(regexFilter)) {
    code = code.replace(regexFilter, replaceFilter);
    fs.writeFileSync('server.js', code, 'utf8');
    console.log('Search filter block patched!');
} else {
    console.log('Search filter block not found!');
}
