const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const regex = /<option value="bolsas">🎒 Bolsas \/ Malas<\/option>/g;
const replacement = `<option value="bolsas">🎒 Bolsas / Malas</option>
          <option value="bones">🧢 Bonés & Chapéus</option>`;

code = code.replace(regex, replacement);
fs.writeFileSync('public/index.html', code, 'utf8');
console.log('HTML patched!');
