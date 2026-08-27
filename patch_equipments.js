const fs = require('fs');

// 1. scraper.js
let scraperCode = fs.readFileSync('scraper.js', 'utf8');
scraperCode = scraperCode.replace(/\s*"https:\/\/pp111115555\.x\.yupoo\.com",?\n/g, '\n');
scraperCode = scraperCode.replace('geral: [', 'equipamentos: [\n      "https://pp111115555.x.yupoo.com"\n    ],\n    geral: [');
fs.writeFileSync('scraper.js', scraperCode, 'utf8');
console.log('scraper.js patched');

// 2. server.js
let serverCode = fs.readFileSync('server.js', 'utf8');
const filterBlock = `// GLOBAL: Remove Equipamentos from everything except esportes_equipamentos
      if (c !== 'esportes_equipamentos') {
          resultados = resultados.filter(i => !(i.domain && i.domain.includes('pp111115555')));
      }\n`;
serverCode = serverCode.replace('// GLOBAL: Remove Size Charts', filterBlock + '      // GLOBAL: Remove Size Charts');
fs.writeFileSync('server.js', serverCode, 'utf8');
console.log('server.js patched');

// 3. public/index.html
let htmlCode = fs.readFileSync('public/index.html', 'utf8');
htmlCode = htmlCode.replace(/<option value="outros">Outros Esportes<\/option>/g, '<option value="equipamentos">Equipamentos & Acessórios</option>\n            <option value="outros">Outros Esportes</option>');
fs.writeFileSync('public/index.html', htmlCode, 'utf8');
console.log('public/index.html patched');
