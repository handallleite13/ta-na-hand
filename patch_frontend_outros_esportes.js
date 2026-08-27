const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const target1 = `<option value="futebol_americano">Futebol Americano</option>
            <option value="rugby">Rugby</option>`;
const replacement1 = `<option value="futebol_americano">Futebol Americano</option>
            <option value="rugby">Rugby</option>
            <option value="outros">Outros Esportes</option>`;

// We have to replace it in both the static HTML and the dynamic JavaScript insertion
html = html.split(target1).join(replacement1);

// Wait, the indentation might be slightly different in the JS string literal vs HTML.
// Let's use regex to be safe.
const htmlRegex = /<option value="rugby">Rugby<\/option>/g;
html = html.replace(htmlRegex, '<option value="rugby">Rugby</option>\n            <option value="outros">Outros Esportes</option>');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Outros Esportes added to frontend!');
