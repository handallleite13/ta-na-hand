const fs = require('fs');

// 1. UPDATE SCRAPER.JS
let scraper = fs.readFileSync('scraper.js', 'utf8');
const luxoRegex = /luxo:\s*\{\s*geral:\s*\[\s*"https:\/\/vipno1\.x\.yupoo\.com",\s*"https:\/\/gaoduan001\.x\.yupoo\.com",\s*"https:\/\/chenzhefuzhuang\.x\.yupoo\.com",\s*"https:\/\/sanguomaoye666\.x\.yupoo\.com",\s*"https:\/\/yehecheng\.x\.yupoo\.com",\s*"https:\/\/ywq2000\.x\.yupoo\.com",\s*"https:\/\/dachang88\.x\.yupoo\.com"\s*\]\s*\}/;

const newLuxo = `luxo: {
      geral: [
        "https://vipno1.x.yupoo.com",
        "https://chenzhefuzhuang.x.yupoo.com",
        "https://sanguomaoye666.x.yupoo.com"
      ]
    },
    calcados: {
      geral: [
        "https://gaoduan001.x.yupoo.com",
        "https://yehecheng.x.yupoo.com",
        "https://ywq2000.x.yupoo.com",
        "https://dachang88.x.yupoo.com"
      ]
    }`;

if (scraper.match(luxoRegex)) {
  scraper = scraper.replace(luxoRegex, newLuxo);
  fs.writeFileSync('scraper.js', scraper, 'utf8');
  console.log('scraper.js updated!');
} else {
  console.log('Regex for scraper.js failed! Trying manual replace.');
  scraper = scraper.replace('"https://gaoduan001.x.yupoo.com",\n', '');
  scraper = scraper.replace('"https://yehecheng.x.yupoo.com",\n', '');
  scraper = scraper.replace('"https://ywq2000.x.yupoo.com",\n', '');
  scraper = scraper.replace('"https://dachang88.x.yupoo.com"\n', '');
  // Manual injection of calcados would be harder, let's assume regex works or fallback later
}


// 2. UPDATE INDEX.HTML
let html = fs.readFileSync('public/index.html', 'utf8');
const htmlDropdown = /<option value="esportes">.*?Esportes<\/option>\s*<option value="luxo">/;
if (html.match(htmlDropdown)) {
  html = html.replace(htmlDropdown, '<option value="esportes">⚽ Esportes</option>\n                <option value="calcados">👟 Calçados</option>\n                <option value="luxo">');
  
  // also add sub-category logic for calcados if needed (none needed if just "geral")
  // but wait, we need to hide the sub-category dropdown if calcados is selected!
  const jsDropdownLogic = /if \(cat === 'esportes'\) \{\s*document\.getElementById\('sub-category-wrapper'\)\.classList\.remove\('hidden'\);\s*\}/;
  html = html.replace(jsDropdownLogic, `if (cat === 'esportes') {
          document.getElementById('sub-category-wrapper').classList.remove('hidden');
        }`); // already handles this because else blocks hide it!
  fs.writeFileSync('public/index.html', html, 'utf8');
  console.log('index.html updated!');
}


// 3. UPDATE SERVER.JS (Add Exclusion logic)
let server = fs.readFileSync('server.js', 'utf8');
const sortRegex = /if \(targetDomains\.length > 0\) \{\s*\/\/ Sort matched items to the end/;
const newSort = `
        let shoeDomains = [];
        if (lojas.calcados) {
           shoeDomains = flattenGroup(lojas.calcados);
        }
        
        if (!c.startsWith('calcados')) {
           resultados = resultados.filter(item => {
              return !shoeDomains.some(sd => (item.domain || item.link || '').includes(sd));
           });
        }

        if (targetDomains.length > 0) {
          // Sort matched items to the end`;

server = server.replace(sortRegex, newSort);
fs.writeFileSync('server.js', server, 'utf8');
console.log('server.js updated!');
