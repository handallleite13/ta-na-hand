const fs = require('fs');
const code = fs.readFileSync('public/index.html', 'utf8');
const match = code.match(/function renderFavsModal\(\) \{[\s\S]*?join\(''\);\n\s*\}/);
if (match) {
    let newCode = code.replace(match[0], `function renderFavsModal() {
      const favsList = document.getElementById('favs-list');
      if (favorites.length === 0) {
        favsList.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500 text-lg">Você não tem favoritos ainda.</div>';
        return;
      }
      favsList.innerHTML = favorites.map(item => renderItem(item)).join('');
    }`);
    fs.writeFileSync('public/index.html', newCode, 'utf8');
    console.log('Force patched via regex match!');
} else {
    console.log('Regex still failed to match.');
}
