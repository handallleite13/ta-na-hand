const fs = require('fs');
let code = fs.readFileSync('sync.js', 'utf8');

const searchWaitAlbums = `      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      stats.paginasLidasHoje++;`;

const replaceWaitAlbums = `      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      try { await page.waitForSelector('.album__main', {timeout: 5000}); } catch(e) {}
      stats.paginasLidasHoje++;`;

code = code.replace(searchWaitAlbums, replaceWaitAlbums);
fs.writeFileSync('sync.js', code, 'utf8');
console.log('sync.js corrigido para esperar álbuns também!');
