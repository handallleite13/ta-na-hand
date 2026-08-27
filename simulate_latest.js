const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("app.get('/api/latest'"));
const end = lines.findIndex((l, i) => i > start && l.includes("app.get('/api/search'"));
const latestCode = lines.slice(start, end).join('\n');
console.log('Includes fitness filter?', latestCode.includes("c.startsWith('fitness')"));

const fsReq = require('fs');
const pathReq = require('path');
const files = fsReq.readdirSync(__dirname);
const catFiles = files.filter(f => f.startsWith('catalogo') && f.endsWith('.json'));
let database = [];
for (let f of catFiles) {
  const data = JSON.parse(fsReq.readFileSync(pathReq.join(__dirname, f), 'utf8'));
  database = database.concat(data);
}

// SIMULATE EXACTLY WHAT THE SERVER DOES FOR c = 'fitness_geral'
let c = 'fitness_geral';
let resultados = database;

// LATEST BLOCK
if (c !== 'todas' && !c.startsWith('fitness')) {
  // Skipping this!
}
//...
if (c.startsWith('esportes_')) {
  // Skipping!
}
if (c && c.startsWith('fitness')) {
   resultados = resultados.filter(item => {
      const t = (item.titulo || '').toLowerCase();
      
      const blockedSportsDomains = ['chenzhefuzhuang', 'xingkong-sports', 'football-all', 'qiumishijie', '8618320710438', 'changjiangsports', 'dongshanstore', 'feitengsports', '007007haoyuntiyu', '1215795243', '3179704378', 'yiyisports2016'];
      if (item.domain && blockedSportsDomains.some(d => item.domain.includes(d))) return false;

      let fitnessRegex = /fitness|academia|segunda pele|compress|紧身|速干|打底|yoga|lululemon|gymshark|alo yoga|nike pro|under armour|fitness|健身|瑜伽|紧身|速干|running|jogger|sweatpants|legging|training|卫衣|卫裤|外套|休闲|运动|套装|圆领|背心|夹克|长裤|短裤|pro\b|combat|打底|dri-fit|segunda pele|compression|compressão|base layer/i;
      let teamTrainingRegex = /nba|lakers|bulls|.../i;
      let bagsRegex = /bolsa/i;
      
      if (!t.match(fitnessRegex) || t.match(teamTrainingRegex) || t.match(bagsRegex)) {
          return false;
      }
      return true;
   });
}

console.log('Result length:', resultados.length);
const sus = resultados.filter(i => (i.domain||'').includes('007007haoyuntiyu'));
console.log('Sus in simulation:', sus.length);
