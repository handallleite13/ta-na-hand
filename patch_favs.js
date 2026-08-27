const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const regexFavs = /function renderFavsModal\(\) \{[\s\S]*?\}\)\.join\(''\);\n    \}/g;
const replaceFavs = `function renderFavsModal() {
      const favsList = document.getElementById('favs-list');
      if (favorites.length === 0) {
        favsList.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500 text-lg">Você não tem favoritos ainda.</div>';
        return;
      }
      favsList.innerHTML = favorites.map(item => renderItem(item)).join('');
    }`;

code = code.replace(regexFavs, replaceFavs);
fs.writeFileSync('public/index.html', code, 'utf8');
console.log('Patched renderFavsModal!');
