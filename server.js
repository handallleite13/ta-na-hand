const express = require('express');
const path = require('path');
const Scraper = require('./scraper');

const fs = require('fs');

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

app.get('/api/search', (req, res) => {
  const query = req.query.q;
  const category = req.query.c || 'todas';
  if (!query) return res.status(400).send('Query required');

  // SSE Setup
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const emit = (type, data) => {
    if (type === 'album_found') {
      const match = data.link.match(/\/albums\/(\d+)/);
      data.id = match ? parseInt(match[1], 10) : 0;
      
      const exists = data.id !== 0 
        ? globalCache.find(a => a.id === data.id)
        : globalCache.find(a => a.link === data.link);
        
      if (!exists) {
        globalCache.push(data);
        fs.writeFileSync(path.join(__dirname, 'cache.json'), JSON.stringify(globalCache));
      }
    }
    res.write('event: ' + type + '\ndata: ' + JSON.stringify(data) + '\n\n');
  };

  if (currentScraper) {
    currentScraper.stop();
  }

  currentScraper = new Scraper(emit);
  
  currentScraper.run(query, category).then(() => {
    emit('finished', true);
    res.end();
  }).catch(err => {
    emit('log', 'Erro interno: ' + err.message);
    emit('finished', false);
    res.end();
  });

  req.on('close', () => {
    if (currentScraper) currentScraper.stop();
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
