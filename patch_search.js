const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Add roupão to customSynonyms
const searchSynonyms = `'all_black': ['all_black'],`;
const replaceSynonyms = `'all_black': ['all_black'],\n          'roupão': ['bathrobe', '浴袍'],\n          'roupao': ['bathrobe', '浴袍'],`;
code = code.replace(searchSynonyms, replaceSynonyms);

// 2. Fix includes substring matching
const searchFilter = `          return translatedKeywords.every(variants => {
            return variants.some(v => titulo.includes(v.replace(/_/g, ' ')));
          });`;

const replaceFilter = `          return translatedKeywords.every(variants => {
            return variants.some(v => {
              const term = v.replace(/_/g, ' ');
              // If it's purely English/ASCII letters, enforce word boundaries to avoid substring false positives (e.g. 'robe' in 'strobel')
              if (/^[a-z ]+$/i.test(term)) {
                return new RegExp('\\\\b' + term + '\\\\b', 'i').test(titulo);
              }
              return titulo.includes(term);
            });
          });`;

code = code.replace(searchFilter, replaceFilter);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Search logic patched!');
