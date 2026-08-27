const fs = require('fs');

// 1. UPDATE INDEX.HTML JS
let html = fs.readFileSync('public/index.html', 'utf8');

const oldChange = /document\.getElementById\('category'\)\.addEventListener\('change',\s*\(\w*\)\s*=>\s*\{[\s\S]*?sub\.classList\.add\('hidden'\);\s*\}/;

const newChange = `document.getElementById('category').addEventListener('change', (e) => {
      const cat = e.target.value;
      const sub = document.getElementById('sub-category-wrapper');
      const subSelect = document.getElementById('sub-category');
      
      if (cat === 'esportes') {
        subSelect.innerHTML = \`
          <option value="geral">Geral</option>
          <option value="automobilismo">Automobilismo</option>
          <option value="basquete">Basquete</option>
          <option value="beisebol">Beisebol</option>
          <option value="futebol">Futebol</option>
          <option value="futebol_americano">Fut. Americano</option>
          <option value="rugby">Rugby</option>
        \`;
        sub.classList.remove('hidden');
      } else if (cat === 'calcados') {
        subSelect.innerHTML = \`
          <option value="geral">Geral</option>
          <option value="chuteiras">Chuteiras</option>
          <option value="casuais">Outros Calçados</option>
        \`;
        sub.classList.remove('hidden');
      } else {
        sub.classList.add('hidden');
      }`;

html = html.replace(oldChange, newChange);
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('index.html JS updated!');

// 2. UPDATE SCRAPER.JS
let scraper = fs.readFileSync('scraper.js', 'utf8');
const oldCalcados = /calcados:\s*\{\s*geral:\s*\[[\s\S]*?\]\s*\}/;
const newCalcados = `calcados: {
      geral: [
        "https://gaoduan001.x.yupoo.com",
        "https://yehecheng.x.yupoo.com",
        "https://ywq2000.x.yupoo.com",
        "https://dachang88.x.yupoo.com"
      ],
      chuteiras: [
        "https://yehecheng.x.yupoo.com",
        "https://ywq2000.x.yupoo.com",
        "https://dachang88.x.yupoo.com"
      ],
      casuais: [
        "https://gaoduan001.x.yupoo.com"
      ]
    }`;

scraper = scraper.replace(oldCalcados, newCalcados);
fs.writeFileSync('scraper.js', scraper, 'utf8');
console.log('scraper.js updated!');
