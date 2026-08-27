const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

// 1. Remove the "Adicionado ao carrinho!" alert
const regexAlert = /alert\("✅ Adicionado ao carrinho!"\);/g;
code = code.replace(regexAlert, '');

// 2. Update Masculino filter to be strict
const regexMasc = /\} else if \(currentFilter === 'masculino'\) \{\s*filtered = dataset\.filter\(i => !\/women\|woman\|female\|lady\|ladies\|女\|feminino\|feminina\|mulher\/i\.test\(i\.original\) && !\/kids\|child\|youth\|童\|infantil\|menino\|menina\|boy\|girl\/i\.test\(i\.original\)\);\s*\}/g;

const replaceMasc = `} else if (currentFilter === 'masculino') {
          filtered = dataset.filter(i => /man\\b|men\\b|male|男|masculino|mens|homem/i.test(i.original));
        }`;

code = code.replace(regexMasc, replaceMasc);
fs.writeFileSync('public/index.html', code, 'utf8');
console.log('Fixed pop-ups and filters!');
