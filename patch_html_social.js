const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

// Insert the new option right before "outros"
const regex = /<option value="outros">📦 Outros<\/option>/g;
const replacement = `<option value="social">👔 Roupas Sociais</option>
              <option value="outros">📦 Outros</option>`;

code = code.replace(regex, replacement);
fs.writeFileSync('public/index.html', code, 'utf8');
console.log('HTML patched!');
