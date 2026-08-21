const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fsSync = require('fs');
const fs = require('fs').promises;
const path = require('path');
const { lojas } = require('./scraper');

const DB_FILE = path.join(__dirname, 'catalogo.json');
const CONCURRENCY = 4;

let catalogo = [];
if (fsSync.existsSync(DB_FILE)) {
  try {
    catalogo = JSON.parse(fsSync.readFileSync(DB_FILE, 'utf8'));
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

// Variáveis para ETA Global baseada em Domínios
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
  
  console.log(`\n======================================================`);
  console.log(`📈 PROGRESSO: ${porcentagem}% (${stats.dominiosConcluidos}/${stats.dominiosTotais} Lojas Concluídas)`);
  console.log(`⏱️  TEMPO ESTIMADO RESTANTE: ~${minutos}m ${segundos}s`);
  console.log(`👕 ITENS NOVOS SALVOS HOJE: ${stats.novosItensNaSessao}`);
  console.log(`📖 PÁGINAS LIDAS ATÉ AGORA: ${stats.paginasLidasHoje}`);
  console.log(`======================================================\n`);
}

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
  const limit = 5000;
  
  while (p <= limit) {
    const url = dominio + '/categories?page=' + p;
    console.log(`[🚀 ${dominio.split('//')[1]}] Lendo página ${p}...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      
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
        console.log(`[✅ FIM] A loja ${dominio.split('//')[1]} não tem mais itens (Parou na ${p})`);
        break; 
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
      stats.paginasLidasHoje++;
      p++;
      
    } catch (e) {
      console.log(`[⚠️ RETRY] Lentidão em ${dominio} pág ${p}. Tentando próxima...`);
      p++;
    }
  }
  
  await page.close();
  stats.dominiosConcluidos++;
  printETA();
}

async function runSync() {
  console.log(`🔥 INICIANDO VARREDURA INTELIGENTE EM ${dominiosAtivos.length} LOJAS 🔥`);
  stats.inicio = Date.now();
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage'
    ]
  });

  for (let i = 0; i < dominiosAtivos.length; i += CONCURRENCY) {
    const chunk = dominiosAtivos.slice(i, i + CONCURRENCY);
    const promises = chunk.map(dominio => syncDomain(browser, dominio));
    await Promise.all(promises);
  }

  await saveDB(); 
  await browser.close();
  console.log('✅ VARREDURA EXTREMA CONCLUÍDA COM SUCESSO!');
}

runSync().catch(console.error);
