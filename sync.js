const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fsSync = require('fs');
const fs = require('fs').promises;
const path = require('path');
const { lojas } = require('./scraper');

const CONCURRENCY = 4;

let catalogo = [];
try {
  const fsReq = require('fs');
  const pathReq = require('path');
  const files = fsReq.readdirSync(__dirname);
  const catFiles = files.filter(f => f.startsWith('catalogo') && f.endsWith('.json'));
  for (let f of catFiles) {
    const filePath = pathReq.join(__dirname, f);
    const data = JSON.parse(fsReq.readFileSync(filePath, 'utf8'));
    catalogo = catalogo.concat(data);
  }
} catch (e) {}

let isSaving = false;
async function saveDB() {
  if (isSaving) return;
  isSaving = true;
  try {
    const CHUNK_SIZE = 50000;
    let chunkCount = 1;
    for (let i = 0; i < catalogo.length; i += CHUNK_SIZE) {
      const chunk = catalogo.slice(i, i + CHUNK_SIZE);
      const filename = path.join(__dirname, `catalogo_${chunkCount}.json`);
      await fs.writeFile(filename, JSON.stringify(chunk));
      chunkCount++;
    }
  } catch(e) {}
  isSaving = false;
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

let stats = {
  dominiosConcluidos: 0,
  dominiosTotais: dominiosAtivos.length,
  inicio: Date.now(),
  novosItensNaSessao: 0,
  paginasLidasHoje: 0
};

function printETA() {
  const agora = Date.now();
  const decorridoMs = agora - stats.inicio;
  if (stats.dominiosConcluidos === 0) return;
  const tempoPorDominioMs = decorridoMs / stats.dominiosConcluidos;
  const dominiosRestantes = stats.dominiosTotais - stats.dominiosConcluidos;
  const tempoRestanteMs = dominiosRestantes * tempoPorDominioMs;
  const minutos = Math.floor(tempoRestanteMs / 60000);
  const segundos = Math.floor((tempoRestanteMs % 60000) / 1000);
  const porcentagem = ((stats.dominiosConcluidos / stats.dominiosTotais) * 100).toFixed(1);
  console.log(`\\n======================================================`);
  console.log(`🚀 PROGRESSO: ${porcentagem}% (${stats.dominiosConcluidos}/${stats.dominiosTotais} Lojas Concluídas)`);
  console.log(`⏳ TEMPO ESTIMADO RESTANTE: ~${minutos}m ${segundos}s`);
  console.log(`📦 ITENS NOVOS SALVOS HOJE: ${stats.novosItensNaSessao}`);
  console.log(`📄 PÁGINAS LIDAS ATÉ AGORA: ${stats.paginasLidasHoje}`);
  console.log(`======================================================\\n`);
}

async function fetchAlbumsFromPage(page, url, dominio, categoryName) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      stats.paginasLidasHoje++;
      
      const albuns = await page.evaluate((domain, catName) => {
        const divs = document.querySelectorAll('.album__main');
        if (divs.length === 0) return null; 
        const results = [];
        divs.forEach(div => {
          const a = div.getAttribute('href');
          const title = div.getAttribute('title');
          const imgEl = div.querySelector('img');
          const img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : null;
          if (a && title) {
            let finalImg = null;
            if (img) {
              finalImg = img.startsWith('//') ? 'https:' + img : img;
            }
            results.push({
              link: domain + a.split('&')[0],
              titulo: title,
              img: finalImg,
              domain: domain,
              yupoo_category_name: catName
            });
          }
        });
        return results;
      }, dominio, categoryName);
      
      return albuns;
    } catch (e) {
      console.log(`[⚠️ RETRY] Lentidão em ${url}. Tentando próxima...`);
      return [];
    }
}

async function syncDomain(browser, dominio) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) req.abort();
    else req.continue();
  });

  console.log(`[🔎 ${dominio.split('//')[1]}] Buscando categorias...`);
  
  let categories = [{ name: 'Uncategorized / All', href: '/categories' }];
  
  try {
      await page.goto(dominio, {waitUntil: 'domcontentloaded', timeout: 30000});
      try { await page.waitForSelector('a[href*="/categories/"]', {timeout: 10000}); } catch(e) {}
      await new Promise(r => setTimeout(r, 2000)); // Garantir tempo pro Vue.js renderizar

      const foundCategories = await page.evaluate(() => {
          const links = document.querySelectorAll('a[href*="/categories/"]');
          return Array.from(links).map(a => ({
              name: a.innerText.trim(),
              href: a.getAttribute('href')
          })).filter(c => c.name.length > 0 && /\d+/.test(c.href));
      });
      // Deduplicate by href
      const uniqueCats = [];
      const seenHrefs = new Set();
      for (const c of foundCategories) {
          if (!seenHrefs.has(c.href)) {
              seenHrefs.add(c.href);
              uniqueCats.push(c);
          }
      }
      categories = categories.concat(uniqueCats);
      console.log(`[✅ ${dominio.split('//')[1]}] Encontrou ${uniqueCats.length} categorias.`);
  } catch (e) {
      console.log(`[⚠️ ${dominio.split('//')[1]}] Falha ao buscar categorias. Usando fallback (Todas).`);
  }

  for (const cat of categories) {
      let p = 1;
      const limit = 50; // Read up to 50 pages per category
      let emptyCount = 0;
      
      while (p <= limit) {
        const url = dominio + cat.href + (cat.href.includes('?') ? '&page=' : '?page=') + p;
        const albuns = await fetchAlbumsFromPage(page, url, dominio, cat.name);
        
        if (!albuns || albuns.length === 0) {
            emptyCount++;
            if (emptyCount >= 2) break; // If 2 empty pages, assume end of category
            p++;
            continue;
        }
        
        let novos = 0;
        let jaExistentesNaSequencia = 0;
        
        for (let item of albuns) {
          const existing = catalogo.find(i => i.link.split('&')[0] === item.link.split('&')[0]);
          if (!existing) {
            catalogo.push(item);
            novos++;
            stats.novosItensNaSessao++;
            jaExistentesNaSequencia = 0;
          } else {
            // Update the existing item with the category name if it didn't have one!
            if (!existing.yupoo_category_name && item.yupoo_category_name && item.yupoo_category_name !== 'Uncategorized / All') {
                existing.yupoo_category_name = item.yupoo_category_name;
            }
            jaExistentesNaSequencia++;
          }
        }
        
        saveDB(); // Salva sempre, pois estamos atualizando as tags de categorias dos itens existentes
        
        // Se encontramos 10 itens seguidos que já existiam, paramos de ler essa categoria para economizar tempo
        // break removido para taguear tudo
        
        p++;
      }
  }
  
  await page.close();
  stats.dominiosConcluidos++;
  printETA();
}

async function runSync() {
  console.log(`🚀 INICIANDO VARREDURA INTELIGENTE (POR CATEGORIA) EM ${dominiosAtivos.length} LOJAS 🚀`);
  stats.inicio = Date.now();
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  for (let i = 0; i < dominiosAtivos.length; i += CONCURRENCY) {
    const chunk = dominiosAtivos.slice(i, i + CONCURRENCY);
    const promises = chunk.map(dominio => syncDomain(browser, dominio));
    await Promise.all(promises);
  }

  await saveDB(); 
  await browser.close();
  console.log('✅ VARREDURA AVANÇADA CONCLUÍDA COM SUCESSO!');
}

runSync().catch(console.error);
