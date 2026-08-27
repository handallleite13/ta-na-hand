const fs = require('fs');

// 1. Patch server.js
let serverCode = fs.readFileSync('server.js', 'utf8');

// Fix `c === 'fitness'` to `c.startsWith('fitness')` for the domain group
serverCode = serverCode.replace(/\|\| c === 'fitness' \|\|/, "|| c.startsWith('fitness') ||");

// Replace the fitness logic block(s)
const fitnessLogicRegex = /\/\/ --- NEW: FITNESS CATEGORY ---[\s\S]*?if \(c === 'fitness'\) \{[\s\S]*?resultados = resultados\.filter[\s\S]*?\}\);[\s\S]*?\}/g;

const newFitnessLogic = `// --- FITNESS CATEGORIES ---
        if (c && c.startsWith('fitness')) {
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              
              // Base exclusion for all fitness
              if (!t.match(fitnessRegex) || t.match(teamTrainingRegex) || t.match(bagsRegex)) {
                  return false;
              }

              if (c === 'fitness_compressao') {
                  return t.match(/segunda pele|compress|紧身|pro|under armour/i);
              }
              if (c === 'fitness_corrida') {
                  return t.match(/running|corrida|跑步|慢跑/i);
              }
              if (c === 'fitness_ciclismo') {
                  return t.match(/ciclismo|cycling|骑行|自行车/i);
              }
              
              return true; // c === 'fitness_geral' or just 'fitness'
           });
        }`;

serverCode = serverCode.replace(fitnessLogicRegex, newFitnessLogic);
fs.writeFileSync('server.js', serverCode, 'utf8');
console.log('Patched server.js with fitness subcategories.');

// 2. Patch public/index.html
let htmlCode = fs.readFileSync('public/index.html', 'utf8');

// Fix Emoji encoding!
htmlCode = htmlCode.replace(/T\ufffd NA HAND!/g, 'TÁ NA HAND!');
htmlCode = htmlCode.replace(/T\ufffd Na Hand!/g, 'TÁ Na Hand!');
htmlCode = htmlCode.replace(/<span class="text-3xl sm:text-4xl shadow-sm drop-shadow-md">\?\?\?\?<\/span>/g, '<span class="text-3xl sm:text-4xl shadow-sm drop-shadow-md">🇧🇷</span>');
htmlCode = htmlCode.replace(/<!-- Bandeira China \(Direita\) -->[\s\S]*?<span class="text-3xl sm:text-4xl shadow-sm drop-shadow-md">\?\?\?\?<\/span>/, '<!-- Bandeira China (Direita) -->\n          <span class="text-3xl sm:text-4xl shadow-sm drop-shadow-md">🇨🇳</span>');
htmlCode = htmlCode.replace(/<title>T\ufffd Na Hand! \?\?\?\? \?\?\?\?<\/title>/, '<title>TÁ Na Hand! 🇧🇷 🇨🇳</title>');

// Add subcategory dropdown logic for fitness
const htmlTarget = `      } else if (cat === 'calcados') {
        subSelect.innerHTML = \`
          <option value="geral">Geral</option>
          <option value="chuteiras">Chuteiras</option>
          <option value="casuais">Outros Calçados</option>
        \`;
        sub.classList.remove('hidden');`;

const htmlReplacement = `      } else if (cat === 'calcados') {
        subSelect.innerHTML = \`
          <option value="geral">Geral</option>
          <option value="chuteiras">Chuteiras</option>
          <option value="casuais">Outros Calçados</option>
        \`;
        sub.classList.remove('hidden');
      } else if (cat === 'fitness') {
        subSelect.innerHTML = \`
          <option value="geral">Geral</option>
          <option value="compressao">Segunda Pele / Compressão</option>
          <option value="corrida">Corrida</option>
          <option value="ciclismo">Ciclismo</option>
        \`;
        sub.classList.remove('hidden');`;

htmlCode = htmlCode.replace(htmlTarget, htmlReplacement);

fs.writeFileSync('public/index.html', htmlCode, 'utf8');
console.log('Patched public/index.html with emojis and fitness subcategories.');
