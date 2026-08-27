const fs = require('fs');
let code = fs.readFileSync('sync.js', 'utf8');

const searchWait = `      await page.goto(dominio, {waitUntil: 'domcontentloaded', timeout: 30000});`;
const replaceWait = `      await page.goto(dominio, {waitUntil: 'domcontentloaded', timeout: 30000});
      try { await page.waitForSelector('a[href*="/categories/"]', {timeout: 10000}); } catch(e) {}
      await new Promise(r => setTimeout(r, 2000)); // Garantir tempo pro Vue.js renderizar
`;

code = code.replace(searchWait, replaceWait);

fs.writeFileSync('sync.js', code, 'utf8');
console.log('sync.js corrigido para esperar as categorias carregarem!');
