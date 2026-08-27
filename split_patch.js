const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const prefix = '    function renderFavsModal() {';
const suffix = '    // Toggle Carrinho';

if (code.includes(prefix) && code.includes(suffix)) {
    const p1 = code.split(prefix)[0];
    const p2 = code.split(suffix)[1];
    
    const newMiddle = `    function renderFavsModal() {
      const favsList = document.getElementById('favs-list');
      if (favorites.length === 0) {
        favsList.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500 text-lg">Você não tem favoritos ainda.</div>';
        return;
      }
      favsList.innerHTML = favorites.map(item => renderItem(item)).join('');
    }

    ${suffix}`;
    
    fs.writeFileSync('public/index.html', p1 + newMiddle + p2.substring(0), 'utf8');
    console.log('Successfully replaced renderFavsModal!');
} else {
    console.log('Prefix or Suffix missing!');
}
