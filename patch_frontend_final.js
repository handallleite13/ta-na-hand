const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const target1 = "if (category === 'esportes') {";
const replacement1 = "if (!document.getElementById('sub-category-wrapper').classList.contains('hidden')) {";

const target2 = "if (sub && sub !== 'geral') category = 'esportes_' + sub;";
const replacement2 = "if (sub && sub !== 'geral') category = category + '_' + sub;";

let count1 = html.split(target1).length - 1;
let count2 = html.split(target2).length - 1;

console.log('Occurrences of target1:', count1);
console.log('Occurrences of target2:', count2);

html = html.split(target1).join(replacement1);
html = html.split(target2).join(replacement2);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('index.html replaced safely!');
