const express = require('express');
const path = require('path');
const { Scraper } = require('./scraper');

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
  
  let database = [];
  const DB_FILE = path.join(__dirname, 'catalogo.json');
  if (fs.existsSync(DB_FILE)) {
    try { database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch(e){}
  }
  
  // Se não houver banco, tenta usar o globalCache legado
  if (database.length === 0 && globalCache.length > 0) {
    database = globalCache;
  }

  let resultados = database;
  
  // Filtrar por Categoria igual na busca
  if (c !== 'todas') {
    const isEsportes = c.startsWith('esportes');
    const sub = c.includes('_') ? c.split('_')[1] : '';
    const { lojas } = require('./scraper');
    const flattenGroup = (group) => {
      let arr = [];
      for (let key in group) {
        if (Array.isArray(group[key])) arr.push(...group[key]);
      }
      return arr;
    };
    
    let dominiosValidos = [];
    if (c === 'esportes') {
      dominiosValidos = flattenGroup(lojas.esportes);
    } else if (isEsportes && lojas.esportes[sub]) {
      dominiosValidos = lojas.esportes[sub];
    } else if (lojas[c]) {
      dominiosValidos = flattenGroup(lojas[c]);
    }
    
    dominiosValidos = dominiosValidos.map(d => d.replace(/\/$/, ''));
    resultados = resultados.filter(item => dominiosValidos.includes(item.domain));
  }
  
  // Pega os 50 mais recentes (assumindo que o banco guarda na ordem, ou vamos embaralhar/pegar últimos)
  res.json(resultados.slice(-50).reverse());
});

app.get('/api/search', (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  const c = req.query.c || 'todas';
  
  let database = [];
  const DB_FILE = path.join(__dirname, 'catalogo.json');
  if (fs.existsSync(DB_FILE)) {
    try { database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch(e){}
  }

  let resultados = database;
  
  // Filtrar por Categoria
  if (c !== 'todas') {
    const isEsportes = c.startsWith('esportes');
    const sub = c.includes('_') ? c.split('_')[1] : '';
    
    // Obter domínios válidos para esta categoria
    const { lojas } = require('./scraper');
    const flattenGroup = (group) => {
      let arr = [];
      for (let key in group) {
        if (Array.isArray(group[key])) arr.push(...group[key]);
      }
      return arr;
    };
    
    let dominiosValidos = [];
    if (c === 'esportes') {
      dominiosValidos = flattenGroup(lojas.esportes);
    } else if (isEsportes && lojas.esportes[sub]) {
      dominiosValidos = lojas.esportes[sub];
    } else if (lojas[c]) {
      dominiosValidos = flattenGroup(lojas[c]);
    }
    
    // Clean trailing slashes
    dominiosValidos = dominiosValidos.map(d => d.replace(/\/$/, ''));
    
    resultados = resultados.filter(item => dominiosValidos.includes(item.domain));
  }
  
  // Filtrar pela Query
  if (query) {
    const keywords = query.split(' ').filter(Boolean);
    resultados = resultados.filter(item => {
      const titulo = item.titulo.toLowerCase();
      // Deve conter TODAS as palavras buscadas
      return keywords.every(kw => titulo.includes(kw));
    });
  }
  
  res.json(resultados);
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
