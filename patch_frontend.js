const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const regexOptions = /<option value="roupas">Roupas<\/option>/g;
const replaceOptions = `<option value="roupas">Roupas (Geral)</option>
          <option value="banho">Roupas de Banho</option>
          <option value="underwear">Underwear (Roupa Íntima)</option>
          <option value="vestidos">Vestidos & Saias</option>`;

if (code.match(regexOptions)) {
    code = code.replace(regexOptions, replaceOptions);
    fs.writeFileSync('public/index.html', code, 'utf8');
    console.log('Frontend updated!');
} else {
    console.log('Regex failed in index.html');
}
