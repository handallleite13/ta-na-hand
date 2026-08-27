const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const regex = /sub\.classList\.remove\('hidden'\);\s*\} else if \(cat === 'calcados'\) \{/g;
const replacement = `sub.classList.remove('hidden');
      } else if (cat === 'luxo') {
        document.getElementById('btn-treino').classList.add('hidden');
        if (typeof currentFilter !== 'undefined' && currentFilter === 'treino') document.querySelector('[data-filter="all"]').click();
        subSelect.innerHTML = \`
          <option value="geral">Geral (Tudo)</option>
          <option value="sneakers">Sneakers (Tênis)</option>
          <option value="roupas">Roupas</option>
        \`;
        sub.classList.remove('hidden');
      } else if (cat === 'calcados') {`;

code = code.replace(regex, replacement);
fs.writeFileSync('public/index.html', code, 'utf8');
console.log('index.html patched!');
