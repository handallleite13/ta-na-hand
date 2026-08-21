const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fsSync = require('fs');
const path = require('path');
const { lojas } = require('./scraper');

const DB_FILE = path.join(__dirname, 'catalogo.json');
const MAX_PAGES_PER_DOMAIN = 50; 
const CONCURRENCY = 2; 

let catalogo = [];
if (fsSync.existsSync(DB_FILE)) {
  try {
    catalogo = JSON.parse(fsSync.readFileSync(DB_FILE, 'utf8'));
    console.log('[+] Catálogo carregado com ' + catalogo.length + ' itens.');
  } catch (e) {}
}

function saveDB() {
  fsSync.writeFileSync(DB_FILE, JSON.stringify(catalogo));
}

let allDomains = new Set();
const extractDomains = (group) => {
  for (let key in group) {
    if (Array.isArray(group[key])) {
      group[key].forEach(d => allDomains.add(d.replace(/\/$/, '')));
    } else if (typeof group[key] === 'object') {
      extractDomains(group[key]);
    }
  }
};
extractDomains(lojas);
const dominiosAtivos = Array.from(allDomains);

async function syncDomain(browser, dominio) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  let p = 1;
  while (p <= MAX_PAGES_PER_DOMAIN) {
    const url = dominio + '/albums?page=' + p;
    console.log('[SYNC] Buscando: ' + url);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const albuns = await page.evaluate((domain) => {
        const divs = document.querySelectorAll('.album__main');
        if (divs.length === 0) return null; 
        const results = [];
        divs.forEach(div => {
          const a = div.getAttribute('href');
          const title = div.getAttribute('title');
          const imgEl = div.querySelector('img');
          const img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : null;
          if (a && title) {
            results.push({
              link: domain + a,
              titulo: title,
              img: img ? "https:" + img : null,
              domain: domain
            });
          }
        });
        return results;
      }, dominio);

      if (!albuns || albuns.length === 0) {
        console.log('[SYNC] Fim das páginas em ' + dominio + ' (Página ' + p + ')');
        break;
      }
      
      let novos = 0;
      for (let item of albuns) {
        if (!catalogo.find(i => i.link === item.link)) {
          catalogo.push(item);
          novos++;
        }
      }
      console.log('[SYNC] ' + dominio + ' (Página ' + p + ') - Encontrados: ' + albuns.length + ' | Novos: ' + novos);
      saveDB();
      p++;
    } catch (e) {
      console.error('[ERRO] Falha em ' + url + ': ' + e.message);
      break;
    }
  }
  await page.close();
}

async function runSync() {
  console.log('Iniciando Sincronização em ' + dominiosAtivos.length + ' domínios...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  for (let i = 0; i < dominiosAtivos.length; i += CONCURRENCY) {
    const chunk = dominiosAtivos.slice(i, i + CONCURRENCY);
    const promises = chunk.map(dominio => syncDomain(browser, dominio));
    await Promise.all(promises);
  }

  await browser.close();
  console.log('Sincronização concluída!');
}

runSync().catch(console.error);
