const express = require('express');

const sportKeywords = {
  basquete: /nba|lakers|bulls|celtics|warriors|heat|knicks|nets|mavericks|suns|bucks|sixers|nuggets|curry|lebron|kobe|durant|篮球|basketball/i,
  futebol_americano: /nfl|chiefs|eagles|patriots|ravens|49ers|packers|cowboys|steelers|dolphins|broncos|raiders|seahawks|buccaneers|橄榄球|super bowl/i,
  beisebol: /mlb|baseball|yankees|dodgers|red sox|braves|astros|cubs|mets|padres|phillies|rangers|棒球/i,
  automobilismo: /\bf1\b|formula 1|formula one|racing|ferrari|mercedes|red\s?bull|mclaren|aston martin|porsche|bmw motorsport|amg|petronas|nascar|motogp|yamaha|车队|赛车/i,
  rugby: /rugby|sevens|all blacks?|sydney rooster|nrl|brumbies|crusaders|hurricanes/i
};
const allOtherSports = new RegExp(Object.values(sportKeywords).map(r => r.source).join('|'), 'i');

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
      if (c.startsWith('esportes') || c === 'fitness') {
          dominiosValidos = flattenGroup(lojas.esportes);
        } else if (lojas[c]) {
          dominiosValidos = flattenGroup(lojas[c]);
        } else if (c.includes('_') && lojas[c.split('_')[0]]) {
          dominiosValidos = flattenGroup(lojas[c.split('_')[0]]);
        }
      dominiosValidos = dominiosValidos.map(d => d.replace(/\/$/, ''));
      resultados = resultados.filter(item => dominiosValidos.includes(item.domain));
      const chuteiraRegexLatest = /fg|tf|ag|sg|mg|ic|in|cleat|chuteira|足球鞋|橄榄球鞋|football|mercurial|predator|f50|phantom|tiempo|copa|future|superfly|vapor/i;
      if (c === 'calcados_chuteiras') {
         resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(chuteiraRegexLatest));
      } else if (c === 'calcados_casuais') {
           resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(chuteiraRegexLatest));
        }

        // --- NEW: ESPORTES KEYWORD FILTERING ---
        if (c.startsWith('esportes_')) {
           const sub = c.replace('esportes_', '');
           if (sportKeywords[sub]) {
              resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(sportKeywords[sub]));
           } else if (sub === 'futebol') {
              // Exclude all other sports to keep football clean
              resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(allOtherSports));
           }
        }
        // --- NEW: FITNESS CATEGORY ---
        if (c === 'fitness') {
           const fitnessRegex = /yoga|lululemon|gymshark|alo yoga|nike pro|under armour|fitness|健身|瑜伽|紧身/i;
           const teamTrainingRegex = /tracksuit|survetement|chandal|tuta|训练|套装|出场服|nba|nfl|mlb|f1|racing|ferrari|mercedes|red\s?bull|mclaren|porsche|rugby|all black|库里|飞人|男篮/i;
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              return t.match(fitnessRegex) && !t.match(teamTrainingRegex);
           });
        }

        // --- NEW: FITNESS CATEGORY ---
        if (c === 'fitness') {
           const fitnessRegex = /yoga|lululemon|gymshark|alo yoga|nike pro|under armour|fitness|健身|瑜伽|紧身/i;
           const teamTrainingRegex = /tracksuit|survetement|chandal|tuta|训练|套装|出场服|nba|nfl|mlb|f1|racing|ferrari|mercedes|red\s?bull|mclaren|porsche|rugby|all black|库里|飞人|男篮/i;
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              return t.match(fitnessRegex) && !t.match(teamTrainingRegex);
           });
        }

    }
  
  // Pega os 50 mais recentes (assumindo que o banco guarda na ordem, ou vamos embaralhar/pegar últimos)
  
    const page = parseInt(req.query.p) || 1;
    const limit = 50;
    const start = Math.max(0, resultados.length - (page * limit));
    const end = resultados.length - ((page - 1) * limit);
    const paginated = end > 0 ? resultados.slice(start, end).reverse() : [];
    res.json(paginated.map(i => ({...i, original: i.titulo, titulo: traduzirTitulo(i.titulo)})));
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
        let q = query;
        // Tratamento de frases multi-palavras antes de separar por espaço
        q = q.replace(/all blacks/g, 'all_blacks');
        q = q.replace(/all black/g, 'all_black');
        q = q.replace(/africa do sul/g, 'south_africa');
        q = q.replace(/áfrica do sul/g, 'south_africa');
        q = q.replace(/nova zelandia/g, 'new_zealand');
        q = q.replace(/nova zelândia/g, 'new_zealand');
        q = q.replace(/costa rica/g, 'costa_rica');
        q = q.replace(/arabia saudita/g, 'saudi_arabia');
        q = q.replace(/arábia saudita/g, 'saudi_arabia');
        q = q.replace(/coreia do sul/g, 'south_korea');
        q = q.replace(/estados unidos/g, 'united_states');
        q = q.replace(/reino unido/g, 'united_kingdom');
        
        const stopWords = ['de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'em', 'um', 'uma'];
        const keywords = q.split(' ').filter(k => k.length > 1 && !stopWords.includes(k));
        
        const customSynonyms = {
          'urss': ['ussr', 'soviet', 'cccp'],
          'eua': ['usa', 'united states', 'american'],
          'holanda': ['netherlands', 'dutch', 'holland'],
          'inglaterra': ['england', 'english'],
          'espanha': ['spain', 'españa', 'spanish'],
          'alemanha': ['germany', 'deutschland', 'german'],
          'italia': ['italy', 'italian'],
          'franca': ['france', 'français', 'french'],
          'japao': ['japan', 'japanese'],
          'mexico': ['mexico', 'mexican'],
          'brasil': ['brazil', 'brazilian'],
          'camaroes': ['cameroon'],
          'dinamarca': ['denmark', 'danish'],
          'escocia': ['scotland', 'scottish'],
          'suecia': ['sweden', 'swedish'],
          'suica': ['switzerland', 'swiss'],
          'croacia': ['croatia', 'croatian'],
          'servia': ['serbia', 'serbian'],
          'marrocos': ['morocco', 'moroccan'],
          'palestina': ['palestine', 'palestinian'],
          'palestine': ['palestina', 'palestinian'],
          'argelia': ['algeria', 'algerian'],
          'egito': ['egypt', 'egyptian'],
          'grecia': ['greece', 'greek'],
          'turquia': ['turkey', 'turkish'],
          'belgica': ['belgium', 'belgian'],
          'uruguai': ['uruguay', 'uruguayan'],
          'colombia': ['colombia', 'colombian'],
          'chile': ['chile', 'chilean'],
          'equador': ['ecuador', 'ecuadorian'],
          'peru': ['peru', 'peruvian'],
          'venezuela': ['venezuela', 'venezuelan'],
          'paraguai': ['paraguay', 'paraguayan'],
          'bolivia': ['bolivia', 'bolivian'],
          'canada': ['canada', 'canadian'],
          'australia': ['australia', 'australian'],
          'coreia': ['korea', 'korean'],
          'spfc': ['sao paulo', 'são paulo'],
          'fla': ['flamengo'],
          'flu': ['fluminense'],
          'timao': ['corinthians'],
          'verdao': ['palmeiras'],
          'galo': ['atletico mineiro'],
          'inter': ['internacional', 'inter milan', 'internazionale'],
          'all_blacks': ['new_zealand', 'zealand', 'all_black'],
          'all_black': ['all_black'],
          'south_africa': ['south_africa', '南非'],
          'new_zealand': ['new_zealand', 'zealand', '新西兰'],
          'costa_rica': ['costa_rica'],
          'saudi_arabia': ['saudi_arabia'],
          'south_korea': ['south_korea'],
          'united_states': ['united_states', 'usa', 'american'],
          'united_kingdom': ['united_kingdom', 'uk']
        };
  
        let translatedKeywords = [];
        try {
          const translate = require('google-translate-api-x');
          for (let kw of keywords) {
            let kwVariants = [kw];
            
            // Apply custom synonyms
            if (customSynonyms[kw]) {
              kwVariants = kwVariants.concat(customSynonyms[kw]);
            }
  
            // Translate to English (Most common for retro shirts and names)
            try {
              const resEn = await translate(kw.replace(/_/g, ' '), {to: 'en'});
              if (resEn && resEn.text) kwVariants.push(resEn.text.toLowerCase().replace(/ /g, '_'));
            } catch(e) {}
            
            // Translate to Chinese (Original Yupoo language)
            try {
              const resZh = await translate(kw.replace(/_/g, ' '), {to: 'zh-CN'});
              if (resZh && resZh.text) kwVariants.push(resZh.text.toLowerCase());
            } catch(e) {}
            
            // Remove duplicates
            kwVariants = [...new Set(kwVariants)];
            translatedKeywords.push(kwVariants);
          }
        } catch(e) {
          translatedKeywords = keywords.map(kw => {
            let variants = [kw];
            if (customSynonyms[kw]) variants = variants.concat(customSynonyms[kw]);
            return variants;
          });
        }
  
        resultados = resultados.filter(item => {
          const titulo = (item.titulo || '').toLowerCase();
          
          // Se a pesquisa for pelo time "All Blacks", barra itens que não sejam de Rugby ou Nova Zelândia
          if (query.includes('all blacks')) {
            const isRugbyDomain = (item.domain || item.link || '').includes('yiyisports2016');
            const hasZealand = titulo.includes('zealand') || titulo.includes('新西兰');
            if (!isRugbyDomain && !hasZealand) return false;
          }
          
          return translatedKeywords.every(variants => {
            return variants.some(v => titulo.includes(v.replace(/_/g, ' ')));
          });
        });
    }
      
      // PRIORITIZE ITEMS FROM THE CURRENT CATEGORY (without excluding globals)
      if (c && c !== 'todas') {
        const { lojas } = require('./scraper');
        const flattenGroup = (group) => {
          let list = [];
          for (let key in group) {
            if (Array.isArray(group[key])) list = list.concat(group[key]);
            else list = list.concat(flattenGroup(group[key]));
          }
          return list;
        };
        
        let targetDomains = [];
        const parts = c.split('_');
        if ((parts[0] === 'esportes' || parts[0] === 'fitness') && lojas.esportes) {
                targetDomains = flattenGroup(lojas.esportes);
             } else if (parts.length === 1 && lojas[parts[0]]) {
                targetDomains = flattenGroup(lojas[parts[0]]);
             } else if (parts.length === 2 && lojas[parts[0]] && lojas[parts[0]][parts[1]]) {
                targetDomains = lojas[parts[0]][parts[1]];
             }
        
        
        let shoeDomains = [];
        if (lojas.calcados) {
           shoeDomains = flattenGroup(lojas.calcados);
        }
        
        if (c.startsWith('calcados')) {
           // STRICTLY KEEP ONLY SHOES (NO CLOTHES)
           resultados = resultados.filter(item => {
              return shoeDomains.some(sd => (item.domain || item.link || '').includes(sd));
           });
           
           const chuteiraRegex = /fg|tf|ag|sg|mg|ic|in|cleat|chuteira|足球鞋|橄榄球鞋|football|mercurial|predator|f50|phantom|tiempo|copa|future|superfly|vapor/i;
           if (c === 'calcados_chuteiras') {
              resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(chuteiraRegex));
           } else if (c === 'calcados_casuais') {
              resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(chuteiraRegex));
           }
        } else if (c !== 'todas') {
           resultados = resultados.filter(item => {
              return !shoeDomains.some(sd => (item.domain || item.link || '').includes(sd));
           });
        }
        
        // --- NEW: ESPORTES STRICT KEYWORD FILTERING FOR SEARCH ---
        if (c && c.startsWith('esportes_')) {
           const sub = c.replace('esportes_', '');
           if (sportKeywords[sub]) {
              // Only keep items matching the specific sport keyword
              resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(sportKeywords[sub]));
           } else if (sub === 'futebol') {
              // Exclude other sports
              resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(allOtherSports));
           }
        }

        if (targetDomains.length > 0) {
          // Sort matched items to the end of the array, so they appear FIRST when paginated/reversed
          resultados.sort((a, b) => {
             let aMatch = targetDomains.some(td => (a.domain || a.link || '').includes(td));
             let bMatch = targetDomains.some(td => (b.domain || b.link || '').includes(td));
             if (aMatch && !bMatch) return 1;
             if (!aMatch && bMatch) return -1;
             return 0;
          });
        }
      }
      
      const page = parseInt(req.query.p) || 1;
    const limit = 50;
    // We reverse search results because we want the latest scraped items first!
    const start = Math.max(0, resultados.length - (page * limit));
    const end = resultados.length - ((page - 1) * limit);
    const paginated = end > 0 ? resultados.slice(start, end).reverse() : [];
    res.json(paginated.map(i => ({...i, original: i.titulo, titulo: traduzirTitulo(i.titulo)})));
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


