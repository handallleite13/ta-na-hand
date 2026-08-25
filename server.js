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

function traduzirTitulo(tituloOriginal) {
  if (!tituloOriginal) return "";
  let t = tituloOriginal;
  
  // Limpar emojis e caracteres inúteis comuns
  t = t.replace(/[🔥✨⭐🏆❤⚽🏅✅💥]/g, '');
  
  // Dicionário focado no vocabulário de Futebol e Esportes para garantir coerência
  const dict = {
    '主场': 'Titular',
    '客场': 'Reserva',
    '二客': 'Alternativa',
    '三客': 'Alternativa',
    '球衣': 'Camisa',
    '男': 'Masculina',
    '女': 'Feminina',
    '儿童': 'Infantil',
    '童装': 'Infantil',
    '童': 'Infantil',
    '泰版': 'Tailandesa',
    '球迷': 'Torcedor',
    '球员': 'Jogador',
    '套装': 'Conjunto',
    '短袖': 'Manga Curta',
    '长袖': 'Manga Longa',
    '外套': 'Jaqueta',
    '风衣': 'Corta Vento',
    '训练': 'Treino',
    '足球鞋': 'Chuteira',
    '袜子': 'Meião',
    '特别版': 'Edição Especial',
    '纪念版': 'Edição Comemorativa',
    '门将': 'Goleiro',
    '长裤': 'Calça',
    '短裤': 'Shorts',
    '裤': 'Shorts',
    '出场服': 'Pré-Jogo',
    '赛前': 'Pré-Jogo',
    '无标': 'Sem Patrocínio',
    '带标': 'Com Patrocínio',
    '连帽': 'Com Capuz',
    '无帽': 'Sem Capuz',
    '紧身': 'Térmica',
    '背心': 'Regata',
    '光板': 'Lisa',
    '定制': 'Personalizada',
    '复古': 'Retrô'
  };

  for (let [ch, pt] of Object.entries(dict)) {
    t = t.split(ch).join(' ' + pt + ' ');
  }

  // Remove qualquer caractere chinês restante (ideogramas) para evitar lixo não traduzido
  t = t.replace(/[\u4e00-\u9fa5]/g, '');

  // Ajusta pontuações soltas e espaços múltiplos
  t = t.replace(/\s+/g, ' ').trim();
  t = t.replace(/^[-\/\\_]+/, '').trim(); // Remove traços no início
  
  return t;
}

// Endpoint de Autocomplete Rápido
app.get('/api/autocomplete', (req, res) => {
    const query = req.query.q || '';
    if (!query || query.length < 3) return res.json([]);
    const termo = query.toLowerCase();
    
    let database = [];
    try {
      const fsReq = require('fs');
      const pathReq = require('path');
      const files = fsReq.readdirSync(__dirname);
      const catFiles = files.filter(f => f.startsWith('catalogo') && f.endsWith('.json'));
      for (let f of catFiles) {
        const filePath = pathReq.join(__dirname, f);
        const data = JSON.parse(fsReq.readFileSync(filePath, 'utf8'));
        database = database.concat(data);
      }
    } catch(e) {}

    const resultados = database.filter(item => 
      (item.titulo || '').toLowerCase().includes(termo)
    ).slice(0, 50);
    
    res.json(resultados.map(i => ({...i, original: i.titulo, titulo: traduzirTitulo(i.titulo)})));
  });

  app.get('/api/latest', (req, res) => {
  const c = req.query.c || 'todas';
    let database = [];
    try {
      const fsReq = require('fs');
      const pathReq = require('path');
      const files = fsReq.readdirSync(__dirname);
      const catFiles = files.filter(f => f.startsWith('catalogo') && f.endsWith('.json'));
      for (let f of catFiles) {
        const filePath = pathReq.join(__dirname, f);
        const data = JSON.parse(fsReq.readFileSync(filePath, 'utf8'));
        database = database.concat(data);
      }
    } catch(e) {}
  
  // Se não houver banco, tenta usar o globalCache legado
  if (database.length === 0 && globalCache.length > 0) {
    database = globalCache;
  }

  let resultados = database;
  
  // Filtrar por Categoria igual na busca
  if (c !== 'todas') {
      const { lojas } = require('./scraper');
      const flattenGroup = (group) => {
        let arr = [];
        for (let key in group) {
          if (Array.isArray(group[key])) arr.push(...group[key]);
          else if (typeof group[key] === 'object') arr = arr.concat(flattenGroup(group[key]));
        }
        return arr;
      };
      let dominiosValidos = [];
      if (c === 'esportes') {
        dominiosValidos = flattenGroup(lojas.esportes);
      } else if (c.startsWith('esportes_') && lojas.esportes[c.split('_')[1]]) {
        dominiosValidos = lojas.esportes[c.split('_')[1]];
      } else if (lojas[c]) {
        dominiosValidos = flattenGroup(lojas[c]);
      } else if (c.includes('_') && lojas[c.split('_')[0]]) {
        dominiosValidos = flattenGroup(lojas[c.split('_')[0]]);
      }
      dominiosValidos = dominiosValidos.map(d => d.replace(/\/$/, ''));
      resultados = resultados.filter(item => dominiosValidos.includes(item.domain));
    }
  
  // Pega os 50 mais recentes (assumindo que o banco guarda na ordem, ou vamos embaralhar/pegar últimos)
  res.json(resultados.slice(-50).reverse().map(i => ({...i, original: i.titulo, titulo: traduzirTitulo(i.titulo)})));
});

  app.get('/api/search', async (req, res) => {
    const query = (req.query.q || '').trim().toLowerCase();
    const c = req.query.c || 'todas';
    
    let database = [];
    try {
      const fsReq = require('fs');
      const pathReq = require('path');
      const files = fsReq.readdirSync(__dirname);
      const catFiles = files.filter(f => f.startsWith('catalogo') && f.endsWith('.json'));
      for (let f of catFiles) {
        const filePath = pathReq.join(__dirname, f);
        const data = JSON.parse(fsReq.readFileSync(filePath, 'utf8'));
        database = database.concat(data);
      }
    } catch(e) {}
  
    let resultados = database;
    
    // Busca global ignorando categoria conforme pedido
    
    // Filtro de Busca Multilingue Inteligente
    if (query) {
      const stopWords = ['de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'em', 'um', 'uma']; const keywords = query.split(' ').filter(k => k.length > 1 && !stopWords.includes(k));
      
      let translatedKeywords = [];
      try {
        const translate = require('google-translate-api-x');
        for (let kw of keywords) {
          let kwVariants = [kw];
          try {
            const resZh = await translate(kw, {to: 'zh-CN'});
            if (resZh && resZh.text) kwVariants.push(resZh.text.toLowerCase());
          } catch(e) {}
          try {
            const resRu = await translate(kw, {to: 'ru'});
            if (resRu && resRu.text) kwVariants.push(resRu.text.toLowerCase());
          } catch(e) {}
          translatedKeywords.push(kwVariants);
        }
      } catch(e) {
        translatedKeywords = keywords.map(kw => [kw]);
      }

      resultados = resultados.filter(item => {
        const titulo = (item.titulo || '').toLowerCase();
        
        return translatedKeywords.every(variants => {
          return variants.some(v => titulo.includes(v));
        });
      });
    }
    
    res.json(resultados.slice(0, 300).map(i => ({...i, original: i.titulo, titulo: traduzirTitulo(i.titulo)})));
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


