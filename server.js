const express = require('express');
const path = require('path');
const Scraper = require('./scraper');

const fs = require('fs');

const CACHE_FILE_BUSCA = path.join(__dirname, 'cache_busca.json');
let cacheBusca = { latest: {}, queries: {} };
if (fs.existsSync(CACHE_FILE_BUSCA)) {
  try { cacheBusca = JSON.parse(fs.readFileSync(CACHE_FILE_BUSCA, 'utf8')); } catch(e) {}
}
function saveCache() {
  fs.writeFileSync(CACHE_FILE_BUSCA, JSON.stringify(cacheBusca));
}

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let currentScraper = null;
let globalCache = [];

try {
  if (fs.existsSync(path.join(__dirname, 'cache.json'))) {
    globalCache = JSON.parse(fs.readFileSync(path.join(__dirname, 'cache.json'), 'utf8'));
  }
} catch (e) {
  console.log('Erro ao ler cache', e);
}

// Endpoint de Autocomplete Rápido
app.get('/api/autocomplete', (req, res) => {
  const query = req.query.q || '';
  if (!query || query.length < 3) return res.json([]);
  
  const termo = query.toLowerCase();
  const resultados = globalCache.filter(item => 
    item.titulo.toLowerCase().includes(termo) || 
    item.original.toLowerCase().includes(termo)
  ).slice(0, 50); // Retorna no máximo 50 para ser instantâneo
  
  res.json(resultados);
});

app.get('/api/latest', (req, res) => {
  const c = req.query.c || 'todas';
  let data = cacheBusca.latest[c] || [];
  
  if (data.length === 0 && globalCache.length > 0) {
    // Fallback inteligente: buscar do globalCache
    const isEsportes = c.startsWith('esportes');
    let sub = c.includes('_') ? c.split('_')[1] : '';
    let kw = [];
    if (sub === 'basquete') kw = ['nba', 'basketball', 'basquete', 'lakers', 'bulls'];
    else if (sub === 'automobilismo') kw = ['f1', 'racing', 'ferrari', 'mercedes', 'red bull', 'bmw', 'porsche', 'aston', 'audi'];
    else if (sub === 'futebol_americano') kw = ['nfl', 'american', 'chiefs', 'eagles', 'patriots'];
    else if (sub === 'rugby') kw = ['rugby'];
    else if (sub === 'beisebol') kw = ['mlb', 'baseball', 'yankees', 'dodgers'];
    else if (sub === 'futebol' || sub === 'geral') kw = ['camisa', 'shirt', 'jersey', 'kit', 'soccer', 'football', 'fc', 'united', 'city', 'real', 'barca'];
    
    if (kw.length > 0) {
      data = globalCache.filter(item => kw.some(k => item.titulo.toLowerCase().includes(k) || (item.original && item.original.toLowerCase().includes(k))));
    } else {
      data = globalCache.slice(-40).reverse(); // últimos globais
    }
  }

  // Se ainda estiver vazio, pega os últimos 20 globais genéricos para não mostrar erro
  if (data.length === 0 && globalCache.length > 0) {
    data = globalCache.slice(-20).reverse();
  }

  res.json(data);
  
  // Atualiza em background se o cache oficial estiver vazio
  if (!cacheBusca.latest[c] || cacheBusca.latest[c].length === 0) {
    const scraper = new Scraper();
    scraper.on('log', () => {});
    scraper.on('progress', () => {});
    scraper.on('search_info', () => {});
    scraper.on('album_found', () => {});
    
    scraper.run('', c).then(() => {
      if (scraper.albunsEncontrados && scraper.albunsEncontrados.length > 0) {
        cacheBusca.latest[c] = scraper.albunsEncontrados.slice(0, 50);
        saveCache();
      }
    }).catch(e => console.error("Erro no background latest:", e));
  }
});

app.get('/api/search', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const emit = (type, data) => {
    try {
      res.write('event: ' + type + '\ndata: ' + JSON.stringify(data) + '\n\n');
    } catch (e) {}
  };

  const query = (req.query.q || '').trim().toLowerCase();
  const c = req.query.c || 'todas';

  let hasSentCache = false;
  if (query && cacheBusca.queries[query]) {
    cacheBusca.queries[query].forEach(item => {
      emit('album_found', item);
    });
    hasSentCache = true;
    emit('progress', { encontrados: cacheBusca.queries[query].length });
  }

  const scraper = new Scraper();

  scraper.on('log', msg => emit('log', msg));
  scraper.on('progress', p => {
    if (hasSentCache) p.encontrados = Math.max(p.encontrados, cacheBusca.queries[query].length);
    emit('progress', p);
  });
  scraper.on('search_info', info => emit('search_info', info));
  
  scraper.on('album_found', data => {
    const existing = globalCache.find(i => i.link === data.link);
    if (!existing) {
      globalCache.push(data);
      fs.writeFileSync(GLOBAL_CACHE_FILE, JSON.stringify(globalCache));
    }
    emit('album_found', data);
  });

  req.on('close', () => {
    scraper.pausarExecucao = true;
    res.end();
  });

  scraper.run(query, c).then(() => {
    if (query && scraper.albunsEncontrados.length > 0) {
      let merged = [...(cacheBusca.queries[query] || []), ...scraper.albunsEncontrados];
      let unique = [];
      let seen = new Set();
      for (let item of merged) {
        if (!seen.has(item.link)) {
          seen.add(item.link);
          unique.push(item);
        }
      }
      cacheBusca.queries[query] = unique;
      saveCache();
    }
    emit('finished', true);
    res.end();
  }).catch(err => {
    emit('log', 'Erro Interno: ' + err.message);
    res.end();
  });
});

app.get('/api/image', (req, res) => {
  const imageUrl = req.query.url;
  const referer = req.query.ref || 'https://x.yupoo.com/';
  if (!imageUrl) return res.status(400).send('URL required');

  const options = {
    headers: {
      'Referer': referer,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  require('https').get(imageUrl, options, (proxyRes) => {
    // Retorna os mesmos headers da imagem original (como Content-Type)
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  }).on('error', (e) => {
    res.status(500).send(e.message);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});
