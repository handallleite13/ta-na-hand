const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fsSync = require('fs');
const fs = require('fs').promises;
const path = require('path');
const { lojas } = require('./scraper');

const DB_FILE = path.join(__dirname, 'catalogo.json');
const CONCURRENCY = 37;

let catalogo = [];
if (fsSync.existsSync(DB_FILE)) {
  try {
    catalogo = JSON.parse(fsSync.readFileSync(DB_FILE, 'utf8'));
    console.log('[+] Catálogo carregado com ' + catalogo.length + ' itens.');
  } catch (e) {}
}

let isSaving = false;
async function saveDB() {
  if (isSaving) return;
  isSaving = true;
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(catalogo));
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

// Variáveis para ETA Global
let stats = {
  dominiosLidos: 0,
  paginasTotais: 0, // Será descoberto dinamicamente
  paginasConcluidas: 0,
  inicio: Date.now(),
  novosItensNaSessao: 0
};

function printETA() {
  const agora = Date.now();
  const decorridoMs = agora - stats.inicio;
  const taxaPaginasPorMs = stats.paginasConcluidas / decorridoMs;
  
  if (stats.paginasConcluidas === 0 || stats.paginasTotais === 0) return;
  
  const paginasRestantes = stats.paginasTotais - stats.paginasConcluidas;
  const tempoRestanteMs = paginasRestantes / taxaPaginasPorMs;
  
  const minutos = Math.floor(tempoRestanteMs / 60000);
  const segundos = Math.floor((tempoRestanteMs % 60000) / 1000);
  const decorridoMin = Math.floor(decorridoMs / 60000);
  
  const porcentagem = ((stats.paginasConcluidas / stats.paginasTotais) * 100).toFixed(1);
  
  console.log(`\n======================================================`);
  console.log(`⏱️  PROGRESSO GLOBAL: ${porcentagem}% (${stats.paginasConcluidas}/${stats.paginasTotais} Páginas)`);
  console.log(`⏱️  TEMPO ESTIMADO RESTANTE: ~${minutos}m ${segundos}s`);
  console.log(`⏱️  ITENS ADICIONADOS HOJE: ${stats.novosItensNaSessao}`);
  console.log(`======================================================\n`);
}

async function syncDomain(browser, dominio) {
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font', 'media', 'other'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // 1. Descobrir total de páginas
  let maxPages = 1;
  try {
    await page.goto(dominio + '/albums?page=1', { waitUntil: 'domcontentloaded', timeout: 25000 });
    const discoveredPages = await page.evaluate(() => {
      const input = document.querySelector('input[name="page"]');
      return input ? parseInt(input.getAttribute('max'), 10) : 1;
    });
    maxPages = discoveredPages > 0 ? discoveredPages : 1;
  } catch (e) {
    maxPages = 50; // Fallback se der erro na página 1
  }

  stats.paginasTotais += maxPages; // Adiciona ao escopo global
  console.log(`[🔎 INFO] ${dominio.split('//')[1]} tem ${maxPages} páginas no total.`);

  // 2. Varrer todas as páginas descobertas
  for (let p = 1; p <= maxPages; p++) {
    const url = dominio + '/albums?page=' + p;
    console.log(`[🚀 ${dominio.split('//')[1]}] Varrendo página ${p}/${maxPages}...`);
    try {
      if (p > 1) {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      }
      
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
            let finalImg = null;
            if (img) {
              finalImg = img.startsWith('//') ? 'https:' + img : img;
            }
            results.push({
              link: domain + a,
              titulo: title,
              img: finalImg,
              domain: domain
            });
          }
        });
        return results;
      }, dominio);

      if (!albuns || albuns.length === 0) {
        break; // Página vazia
      }
      
      let novos = 0;
      for (let item of albuns) {
        if (!catalogo.find(i => i.link === item.link)) {
          catalogo.push(item);
          novos++;
          stats.novosItensNaSessao++;
        }
      }
      
      if (novos > 0) saveDB(); 
      
    } catch (e) {
      console.log(`[⚠️ RETRY] Lentidão em ${dominio} pág ${p}. Indo para próxima...`);
    }
    
    // Atualiza estatísticas globais ao terminar a página
    stats.paginasConcluidas++;
    
    // Imprime ETA a cada 10 páginas globais processadas (para não floodar o console)
    if (stats.paginasConcluidas % 10 === 0) {
      printETA();
    }
  }
  
  await page.close();
  stats.dominiosLidos++;
}

async function runSync() {
  console.log(`🔥 INICIANDO VARREDURA INTELIGENTE EM ${dominiosAtivos.length} DOMÍNIOS SIMULTANEAMENTE 🔥`);
  stats.inicio = Date.now();
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  const chunk = dominiosAtivos.slice(0, CONCURRENCY);
  const promises = chunk.map(dominio => syncDomain(browser, dominio));
  
  await Promise.all(promises);

  await saveDB(); 
  await browser.close();
  printETA(); // Imprime o final
  console.log('✅ VARREDURA EXTREMA CONCLUÍDA COM SUCESSO!');
}

runSync().catch(console.error);
