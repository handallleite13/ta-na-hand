const fs = require('fs');

// Read the v0.44 HTML
let html = fs.readFileSync('old_index.html', 'utf8');

// 1. Replace emojis with flag images
html = html.replace(/<span class="text-3xl sm:text-4xl shadow-sm drop-shadow-md">🇧🇷<\/span>/, '<img src="https://flagcdn.com/w80/br.png" width="40" alt="Bandeira do Brasil" class="shadow-sm drop-shadow-md rounded-sm">');
html = html.replace(/<span class="text-3xl sm:text-4xl shadow-sm drop-shadow-md">🇨🇳<\/span>/, '<img src="https://flagcdn.com/w80/cn.png" width="40" alt="Bandeira da China" class="shadow-sm drop-shadow-md rounded-sm">');
html = html.replace(/<title>.*?<\/title>/, '<title>TÁ Na Hand! 🇧🇷 🇨🇳</title>');
html = html.replace(/T Na Hand/g, 'TÁ Na Hand');

// 2. Insert Fitness subcategory dropdown
const target = \} else if (cat === 'calcados') {
        subSelect.innerHTML = \\\
          <option value="geral">Geral</option>
          <option value="chuteiras">Chuteiras</option>
          <option value="casuais">Outros Calçados</option>
        \\\;
        sub.classList.remove('hidden');\;

const replacement = \} else if (cat === 'calcados') {
        subSelect.innerHTML = \\\
          <option value="geral">Geral</option>
          <option value="chuteiras">Chuteiras</option>
          <option value="casuais">Outros Calçados</option>
        \\\;
        sub.classList.remove('hidden');
      } else if (cat === 'fitness') {
        subSelect.innerHTML = \\\
          <option value="geral">Geral</option>
          <option value="compressao">Segunda Pele / Compressão</option>
          <option value="corrida">Corrida</option>
          <option value="ciclismo">Ciclismo</option>
        \\\;
        sub.classList.remove('hidden');\;

html = html.replace(target, replacement);

// 3. Update build version to v0.46
html = html.replace(/BUILD v0\.44/g, 'BUILD v0.46');

fs.writeFileSync('public/index.html', html, 'utf8');
