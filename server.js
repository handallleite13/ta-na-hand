const express = require('express');


const chineloRegex = /chinelo|slide|sand[áa]lia|pantufa|slipper|sandal|flip\s*flop|拖\s*鞋|凉鞋|沙滩|果冻鞋|洞洞鞋|croc/i;
const bagsRegex = /bag|backpack|\\bbolsa\\b|\\bmochila\\b|\\bmala\\b|双肩包|单肩包|手提包|旅行包|腰包|斜挎包|书包|胸包|背包/i;
const chuteiraRegex = /fg|tf|ag|sg|mg|ic|in|cleat|chuteira|足球鞋|橄榄球鞋|football|mercurial|predator|f50|phantom|tiempo|copa|future|superfly|vapor|spike|astro|leg guard|shin guard|钉鞋|护腿板/i;
const fitnessRegex = /yoga|lululemon|gymshark|alo yoga|nike pro|under armour|fitness|健身|瑜伽|紧身|速干|running|jogger|sweatpants|legging|training|卫衣|卫裤|外套|休闲|运动|套装|圆领|背心|夹克|长裤|短裤|pro\\b|combat|打底|dri-fit|segunda pele|compression|compressão|base layer/i;


const sportKeywords = {
  basquete: /nba|lakers|bulls|celtics|warriors|heat|knicks|nets|mavericks|suns|bucks|sixers|nuggets|curry|lebron|kobe|durant|篮球|basketball|jordan|湖人|勇士|公牛|凯尔特人|热火|尼克斯|篮网|独行侠|太阳|雄鹿|76人|掘金|atlanta hawks|\\bhawks\\b|国王|\\bkings\\b|火箭|rockets|马刺|spurs|猛龙|raptors|灰熊|grizzlies/i,
  futebol_americano: /nfl|chiefs|eagles|patriots|ravens|49ers|packers|cowboys|steelers|dolphins|broncos|raiders|seahawks|buccaneers|rams|giants|bengals|jets|lions|bears|bills|texans|colts|jaguars|titans|chargers|falcons|panthers|saints|commanders|cardinals|vikings|browns|橄榄球|super bowl|海鹰|包装工|49人|野马|突袭者|酋长|爱国者|乌鸦|钢人|海豚|海盗|公羊|巨人|孟加拉虎|喷气机|狮子|熊|比尔|德州人|小马|美洲虎|泰坦|闪电|猎鹰|圣徒|指挥官|红雀|维京人|布朗/i,
  beisebol: /mlb|baseball|yankees|dodgers|red sox|braves|astros|cubs|mets|padres|phillies|rangers|棒球|扬基|道奇|红袜|太空人|小熊|大都会|教士|费城人|游骑兵/i,
  automobilismo: /\bf1\b|formula 1|formula one|red bull racing|ferrari|mercedes|red\s?bull|mclaren|aston martin|porsche|bmw motorsport|amg|petronas|nascar|motogp|yamaha|车队|赛车/i,
  rugby: /rugby|sevens|all blacks?|sydney rooster|nrl|brumbies|crusaders|hurricanes/i
};
const allOtherSports = new RegExp(Object.values(sportKeywords).map(r => r.source).join('|'), 'i');

const teamTrainingRegex = new RegExp('tracksuit|survetement|chandal|tuta|训练|出场服|主场|客场|球衣|足球|泰版|球迷版|球员版|法国|阿根廷|巴西|英格兰|葡萄牙|西班牙|意大利|德国|荷兰|madrid|barcelona|psg|munich|united|city|arsenal|chelsea|liverpool|juventus|milan|inter|spurs|tottenham|ajax|boca|river plate|flamengo|corinthians|palmeiras|sao paulo|gremio|cruzeiro|atletico|vasco|fluminense|botafogo|巴黎|皇马|巴塞|巴萨|拜仁|曼城|曼联|阿森纳|切尔西|利物浦|尤文|米兰|马竞|多特|国米|罗马|' + Object.values(sportKeywords).map(r => r.source).join('|'), 'i');
const outrosEsportesRegex = /nhl|hockey|冰球|afl|australian rules|tennis|网球|golf|高尔夫|badminton|羽毛球|volleyball|排球|cycling|骑行|boxing|拳击|mma|ufc/i;
const globalSportsRegex = new RegExp(teamTrainingRegex.source + '|' + outrosEsportesRegex.source, 'i');

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
    if (!query || query.length < 3) return res.setHeader('Cache-Control', 'no-store');
    res.json([]);
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
      ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase().includes(termo)
    ).slice(0, 50);
    
    res.setHeader('Cache-Control', 'no-store');
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
        if (!group) return [];
        if (Array.isArray(group)) return group;
        let arr = [];
        for (let key in group) {
          if (Array.isArray(group[key])) arr.push(...group[key]);
          else if (typeof group[key] === 'object') arr = arr.concat(flattenGroup(group[key]));
        }
        return arr;
      };
      let dominiosValidos = [];
      if (c.startsWith('esportes') || c === 'bolsas') {
        if (c === 'esportes_outros') {
            const { futebol, basquete, ...rest } = lojas.esportes;
            dominiosValidos = flattenGroup(rest);
        } else if (c === 'esportes' || c === 'esportes_geral' || c === 'bolsas') {
            dominiosValidos = flattenGroup(c === 'bolsas' ? lojas.bolsas || lojas : lojas.esportes);
        } else {
            const sub = c.replace('esportes_', '');
            dominiosValidos = flattenGroup(lojas.esportes[sub] || lojas.esportes);
        }
      } else if (c.startsWith('fitness')) {
        dominiosValidos = flattenGroup(lojas); // Fitness scans all domains!
            } else if (c === 'luxo' || c.startsWith('luxo_') || c === 'social' || c === 'bones') {
        dominiosValidos = flattenGroup(lojas);
      } else if (lojas[c]) {
        dominiosValidos = flattenGroup(lojas[c]);
      } else if (c.includes('_') && lojas[c.split('_')[0]]) {
        dominiosValidos = flattenGroup(lojas[c.split('_')[0]]);
      }
      dominiosValidos = dominiosValidos.map(d => d.replace(/\/$/, ''));
            resultados = resultados.filter(item => {
               if (c === 'esportes_equipamentos') {
                  const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
                  if (t.match(/meia|meião|sock|袜|shin guard|leg guard|护腿|caneleira|gym sack|bolsa de esporte/i)) return true;
               }
               return dominiosValidos.includes(item.domain);
            });

      // GLOBAL: Isolate Equipamentos
      if (c !== 'esportes_equipamentos') {
          resultados = resultados.filter(item => !(item.domain && item.domain.includes('pp111115555')));
      }
      
      // GLOBAL: Remove Size Charts
      resultados = resultados.filter(item => {
        const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
        // GLOBAL BLOCKS: Size charts, links to albums (not actual items), and the specific NBA generic size chart title
        if (t === 'nba篮球球衣') return false;
        if (t.match(/尺码|size chart|tabela de tamanho|tamanho recomendado|尺码表|size table|size guide|measurements/i)) return false;
        if (t.match(/álbum de treinamento|album link|image link|catalog link|patch accessories|link do álbum/i)) return false;
        return true;
      });
            if (c === 'calcados_chuteiras') {
         resultados = resultados.filter(item => ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase().match(chuteiraRegex) && !((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase().match(/meia|meião|sock|leg guard|shin guard|护腿板|袜子/));
      } else if (c === 'calcados_casuais') {
           resultados = resultados.filter(item => !((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase().match(chuteiraRegex));
        }

        // --- NEW: ESPORTES KEYWORD FILTERING ---
        
        
        // GLOBAL: Isolate Equipamentos
        if (c && c !== 'esportes_equipamentos') {
            resultados = resultados.filter(item => !(item.domain && item.domain.includes('pp111115555')));
        }
        
        // --- GLOBAL ISOLATION FOR LUXO AND OUTROS ---
        if (c === 'luxo' || c.startsWith('luxo_') || c.startsWith('outros_')) {
           const sportsBrandsRegex = /nike|adidas|puma|converse|air jordan|jordan|vans|under armour|new balance|reebok|asics|fila|kappa|WXG-NK|WXG-AD|WXG-BM|WXG-KW/i;
           const luxuryBrands = /gucci|prada|louis vuitton|\blv\b|balenciaga|dior|burberry|versace|fendi|amiri|givenchy|chanel|hermes|rolex|古驰|普拉达|路易威登|巴黎世家|迪奥|博柏利|范思哲|芬迪/i;
           
           resultados = resultados.filter(item => {
              const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
              if (c === 'luxo' || c.startsWith('luxo_')) {
                  const isStrictLuxuryDomain = ['407131796', '3179704378'].some(d => item.domain && item.domain.includes(d));
                  if ((!t.match(luxuryBrands) && !isStrictLuxuryDomain) || t.match(bagsRegex)) return false;
                  
                  const isSneaker = t.match(/sneaker|shoe|tenis|tênis|dunk|jordan|force|skool|sapatilha|boot|鞋/i);
                  
                  if (c === 'luxo_sneakers') {
                      // 407131796 only sells sandals/chinelos, they have 0 sneakers in their catalog.
                      // Their titles are often generic like "P105", so text filtering fails. Block domain entirely from sneakers.
                      if (item.domain && item.domain.includes('407131796')) return false;
                      return isSneaker && !t.match(chineloRegex);
                  } else if (c === 'luxo_banho') {
                      return t.match(/swim|beach|sunga|bikini|biquini|biquíni|maiô|maio|泳|比基尼|沙滩|swimming|banho/i);
                  } else if (c === 'luxo_underwear') {
                      return t.match(/underwear|cueca|calcinha|lingerie|sutiã|sutia|boxer|brief|panties|\bbra\b|内衣|内裤|胸罩|文胸/i);
                  } else if (c === 'luxo_vestidos') {
                      return t.match(/dress|skirt|vestido|saia|裙|连衣裙|半身裙|长裙|短裙/i);
                  } else if (c === 'luxo_roupas') {
                      const isVestido = t.match(/dress|skirt|vestido|saia|裙|连衣裙|半身裙|长裙|短裙/i);
                      const isUnderwear = t.match(/underwear|cueca|calcinha|lingerie|sutiã|sutia|boxer|brief|panties|\bbra\b|内衣|内裤|胸罩|文胸/i);
                      const isBanho = t.match(/swim|beach|sunga|bikini|biquini|biquíni|maiô|maio|泳|比基尼|沙滩|swimming|banho/i);
                      return !isSneaker && !isVestido && !isUnderwear && !isBanho && !t.match(chuteiraRegex);
                  }
                  
                  return !t.match(chuteiraRegex); // Geral keeps everything except bags/cleats
              } else {
                  // For outros_, just exclude everything
                  return !t.match(bagsRegex) && !t.match(chuteiraRegex) && !t.match(fitnessRegex) && !t.match(globalSportsRegex) && !t.match(sportsBrandsRegex);
              }
           });
        }
        // --- NEW: ESPORTES OUTROS ---
        if (c === 'esportes_outros') {
           resultados = resultados.filter(item => {
              const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
              // Prevent generic football/soccer jerseys from flooding Outros
              const genericFootballRegex = /\b\d{2}-\d{2}\b|home|away|third|player|fans|treino|regata|soccer|futebol|football|足球/i;
              // Must not match the major sports, bags, fitness, or generic football.
              return !t.match(bagsRegex) && !t.match(chuteiraRegex) && !t.match(fitnessRegex) && !t.match(teamTrainingRegex) && !t.match(allOtherSports) && !t.match(genericFootballRegex);
           });
        }

        // --- NEW: BOLSAS CATEGORY ---
                if (c === 'bolsas') {
           resultados = resultados.filter(item => {
              const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
              return t.match(bagsRegex) && !t.match(/包裹|kailas|vibram|徒步鞋|登山鞋|跑山|越野|跑鞋/i) && !t.match(/meia|meião|sock|袜|shin guard|leg guard|护腿|caneleira|gym sack|bolsa de esporte/i);
           });
        } else if (c === 'social') {
           const dressShirts = /衬衫|social|dress shirt|camisa social|terno|alfaiataria|formal suit|business suit|西装|西服/i;
           resultados = resultados.filter(item => {
               const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
               const isSneaker = t.match(/sneaker|shoe|tenis|tênis|dunk|jordan|force|skool|sapatilha|boot|鞋/i);
               return t.match(dressShirts) && !t.match(bagsRegex) && !isSneaker;
           });
        } else if (c === 'bones') {
           const hatsRegex = /boné|\bbone\b|chapéu|chapeu|touca|gorro|viseira|\bcap\b|\bhat\b|beanie|snapback|bucket|帽子|棒球帽|毛线帽|渔夫帽|cachecol|scarf|shawl|围巾|披肩/i;
           resultados = resultados.filter(item => {
               const orig = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
               const isSneaker = orig.match(/sneaker|shoe|tenis|tênis|dunk|jordan|force|skool|sapatilha|boot|鞋/i);
               return orig.match(hatsRegex) && !orig.match(bagsRegex) && !isSneaker;
           });
        } else if (c !== 'todas') {
           // Exclude bags from all other categories globally
           resultados = resultados.filter(item => !((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase().match(bagsRegex));
        }

        if (c.startsWith('esportes_')) {
           const sub = c.replace('esportes_', '');
           if (sportKeywords[sub]) {
              resultados = resultados.filter(item => {
                 let t = (item.original || item.titulo || '').toLowerCase();
                 if (sub === 'beisebol' && t.match(/nhl|new york rangers|hockey|ice hockey|冰球/i)) return false;
                 if (sub === 'automobilismo' && t.match(/92赛车|法国92|racing 92|92 titular|92 reserva/i)) return false;
                 return t.match(sportKeywords[sub]);
              });
           } else if (sub === 'futebol') {
              // Exclude all other sports to keep football clean
              const luxuryBrands = /gucci|prada|louis vuitton|\blv\b|balenciaga|dior|burberry|versace|fendi|amiri|givenchy|chanel|hermes|rolex|古驰|普拉达|路易威登|巴黎世家|迪奥|博柏利|范思哲|芬迪/i;
              const dressShirts = /衬衫|social|dress shirt|camisa social|terno|alfaiataria|formal suit|business suit|西装|西服/i;
              resultados = resultados.filter(item => {
                  const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
                  return !t.match(allOtherSports) && !t.match(luxuryBrands) && !t.match(dressShirts) && !t.match(chuteiraRegex);
              });
           }
        }
        // --- FITNESS CATEGORIES ---
        if (c && c.startsWith('fitness')) {
           resultados = resultados.filter(item => {
              const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
              
              // Base exclusion for all fitness
              
              // BLINDAGEM: Block domains that are strictly team sports so their generic 'Shorts' and 'Regatas' don't leak into Fitness
              const blockedSportsDomains = ['chenzhefuzhuang', 'xingkong-sports', 'football-all', 'qiumishijie', '8618320710438', 'changjiangsports', 'dongshanstore', 'feitengsports', '007007haoyuntiyu', '1215795243', '3179704378', 'yiyisports2016'];
              if (item.domain && blockedSportsDomains.some(d => item.domain.includes(d))) return false;

              // Base exclusion
              const jeansRegex = /jeans|denim|\u725B\u4ED4/i;
              if (!t.match(fitnessRegex) || t.match(teamTrainingRegex) || t.match(bagsRegex) || t.match(jeansRegex)) {
                  return false;
              }

              if (c === 'fitness_compressao') {
                  return t.match(/segunda pele|compress|紧身|速干|打底|pro|under armour/i);
              }
              if (c === 'fitness_corrida') {
                  return t.match(/running|corrida|跑步|慢跑/i);
              }
              if (c === 'fitness_ciclismo') {
                  return t.match(/ciclismo|cycling|骑行|自行车/i);
              }
              
              return true; // c === 'fitness_geral' or just 'fitness'
           });
        }

        // --- FITNESS CATEGORIES ---
        if (c && c.startsWith('fitness')) {
           resultados = resultados.filter(item => {
              const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
              
              // Base exclusion for all fitness
              
              // BLINDAGEM: Block domains that are strictly team sports so their generic 'Shorts' and 'Regatas' don't leak into Fitness
              const blockedSportsDomains = ['chenzhefuzhuang', 'xingkong-sports', 'football-all', 'qiumishijie', '8618320710438', 'changjiangsports', 'dongshanstore', 'feitengsports', '007007haoyuntiyu', '1215795243', '3179704378', 'yiyisports2016'];
              if (item.domain && blockedSportsDomains.some(d => item.domain.includes(d))) return false;

              // Base exclusion
              const jeansRegex = /jeans|denim|\u725B\u4ED4/i;
              if (!t.match(fitnessRegex) || t.match(teamTrainingRegex) || t.match(bagsRegex) || t.match(jeansRegex)) {
                  return false;
              }

              if (c === 'fitness_compressao') {
                  return t.match(/segunda pele|compress|紧身|速干|打底|pro|under armour/i);
              }
              if (c === 'fitness_corrida') {
                  return t.match(/running|corrida|跑步|慢跑/i);
              }
              if (c === 'fitness_ciclismo') {
                  return t.match(/ciclismo|cycling|骑行|自行车/i);
              }
              
              return true; // c === 'fitness_geral' or just 'fitness'
           });
        }

    }
  
  // Pega os 50 mais recentes (assumindo que o banco guarda na ordem, ou vamos embaralhar/pegar últimos)
  
    const page = parseInt(req.query.p) || 1;
    const limit = 50;
    const start = Math.max(0, resultados.length - (page * limit));
    const end = resultados.length - ((page - 1) * limit);
    const paginated = end > 0 ? resultados.slice(start, end).reverse() : [];
    res.setHeader('Cache-Control', 'no-store');
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
        q = q.replace(/meia calça/g, 'meia_calça');
        q = q.replace(/meia calca/g, 'meia_calça');
        
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
          'roupão': ['bathrobe', '浴袍'],
          'roupao': ['bathrobe', '浴袍'],
          'meia_calça': ['tights', 'pantyhose', 'leggings', '连裤袜', '裤袜', '丝袜', 'meia-calça', 'meia-calca'],
          'vestido': ['dress', '连衣裙', '裙子', '裙'],
          'saia': ['skirt', '半身裙', '短裙', '长裙'],
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
          const titulo = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
          
          // Se a pesquisa for pelo time "All Blacks", barra itens que não sejam de Rugby ou Nova Zelândia
          if (query.includes('all blacks')) {
            const isRugbyDomain = (item.domain || item.link || '').includes('yiyisports2016');
            const hasZealand = titulo.includes('zealand') || titulo.includes('新西兰');
            if (!isRugbyDomain && !hasZealand) return false;
          }
          
          return translatedKeywords.every(variants => {
            return variants.some(v => {
              const term = v.replace(/_/g, ' ');
              if (/^[a-z ]+$/i.test(term)) {
                return new RegExp('\\b' + term + '\\b', 'i').test(titulo);
              }
              return titulo.includes(term);
            });
          });
        });
    }
      
      // PRIORITIZE ITEMS FROM THE CURRENT CATEGORY (without excluding globals)
      if (c && c !== 'todas') {
        const { lojas } = require('./scraper');
        const flattenGroup = (group) => {
          if (!group) return [];
          if (Array.isArray(group)) return group;
          let list = [];
          for (let key in group) {
            if (Array.isArray(group[key])) list = list.concat(group[key]);
            else if (typeof group[key] === 'object') list = list.concat(flattenGroup(group[key]));
          }
          return list;
        };
        
        let targetDomains = [];
        const parts = c.split('_');
        if ((parts[0] === 'esportes' || parts[0] === 'bolsas') && lojas.esportes) {
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
         resultados = resultados.filter(item => ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase().match(chuteiraRegex) && !((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase().match(/meia|meião|sock|leg guard|shin guard|护腿板|袜子/));
      } else if (c === 'calcados_casuais') {
              resultados = resultados.filter(item => !((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase().match(chuteiraRegex));
           }
        } else if (c === 'bones') {
           const hatsRegex = /boné|\bbone\b|chapéu|chapeu|touca|gorro|viseira|\bcap\b|\bhat\b|beanie|snapback|bucket|帽子|棒球帽|毛线帽|渔夫帽|cachecol|scarf|shawl|围巾|披肩/i;
           resultados = resultados.filter(item => {
               const orig = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
               const isSneaker = orig.match(/sneaker|shoe|tenis|tênis|dunk|jordan|force|skool|sapatilha|boot|鞋/i);
               return orig.match(hatsRegex) && !orig.match(bagsRegex) && !isSneaker;
           });
        } else if (c !== 'todas') {
           resultados = resultados.filter(item => {
              return !shoeDomains.some(sd => (item.domain || item.link || '').includes(sd));
           });
        }
        
        // --- NEW: ESPORTES STRICT KEYWORD FILTERING FOR SEARCH ---
        
        
        // --- GLOBAL ISOLATION FOR LUXO AND OUTROS ---
        if (c && ((c === 'luxo' || c.startsWith('luxo_')) || c.startsWith('outros_'))) {
           resultados = resultados.filter(item => {
              const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
              return !t.match(bagsRegex) && !t.match(chuteiraRegex) && !t.match(fitnessRegex) && !t.match(globalSportsRegex);
           });
        }

        // --- NEW: ESPORTES OUTROS ---
        if (c === 'esportes_outros') {
           resultados = resultados.filter(item => {
              const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
              return !t.match(bagsRegex) && !t.match(chuteiraRegex) && !t.match(fitnessRegex) && !t.match(teamTrainingRegex) && !t.match(allOtherSports);
           });
        }

        // --- NEW: BOLSAS CATEGORY FOR SEARCH ---
                if (c === 'bolsas') {
           resultados = resultados.filter(item => {
              const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
              return t.match(bagsRegex) && !t.match(/包裹|kailas|vibram|徒步鞋|登山鞋|跑山|越野|跑鞋/i) && !t.match(/meia|meião|sock|袜|shin guard|leg guard|护腿|caneleira|gym sack|bolsa de esporte/i);
           });
        } else if (c === 'bones') {
           const hatsRegex = /boné|\bbone\b|chapéu|chapeu|touca|gorro|viseira|\bcap\b|\bhat\b|beanie|snapback|bucket|帽子|棒球帽|毛线帽|渔夫帽/i;
           resultados = resultados.filter(item => {
               const orig = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
               const isSneaker = orig.match(/sneaker|shoe|tenis|tênis|dunk|jordan|force|skool|sapatilha|boot|鞋/i);
               return orig.match(hatsRegex) && !orig.match(bagsRegex) && !isSneaker;
           });
        } else if (c !== 'todas') {
           resultados = resultados.filter(item => !((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase().match(bagsRegex));
        }

        if (c && c.startsWith('esportes_')) {
           const sub = c.replace('esportes_', '');
           if (sportKeywords[sub]) {
              // Only keep items matching the specific sport keyword
              resultados = resultados.filter(item => ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase().match(sportKeywords[sub]));
           } else if (sub === 'futebol') {
              // Exclude other sports
              const luxuryBrands = /gucci|prada|louis vuitton|\blv\b|balenciaga|dior|burberry|versace|fendi|amiri|givenchy|chanel|hermes|rolex|古驰|普拉达|路易威登|巴黎世家|迪奥|博柏利|范思哲|芬迪/i;
              const dressShirts = /衬衫|social|dress shirt|camisa social|terno|alfaiataria|formal suit|business suit|西装|西服/i;
              resultados = resultados.filter(item => {
                  const t = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();
                  return !t.match(allOtherSports) && !t.match(luxuryBrands) && !t.match(dressShirts) && !t.match(chuteiraRegex);
              });
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
    res.setHeader('Cache-Control', 'no-store');
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


