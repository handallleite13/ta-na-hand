const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Patch /api/search
const searchRegex = /if \(!c\.startsWith\('calcados'\)\) \{\s*resultados = resultados\.filter\(item => \{\s*return !shoeDomains\.some\(sd => \(item\.domain \|\| item\.link \|\| ''\)\.includes\(sd\)\);\s*\}\);\s*\}/;

const searchReplacement = `if (c.startsWith('calcados')) {
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
        }`;

code = code.replace(searchRegex, searchReplacement);

// 2. Patch /api/latest
const latestRegex = /if \(c === 'calcados_chuteiras'\) \{[\s\S]*?return !t\.match\(\/fg\|tf\|ag\|sg\|ic\|in\|chuteira\|足球鞋\|football\/\);\s*\}\);\s*\}/;

const latestReplacement = `const chuteiraRegexLatest = /fg|tf|ag|sg|mg|ic|in|cleat|chuteira|足球鞋|橄榄球鞋|football|mercurial|predator|f50|phantom|tiempo|copa|future|superfly|vapor/i;
      if (c === 'calcados_chuteiras') {
         resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(chuteiraRegexLatest));
      } else if (c === 'calcados_casuais') {
         resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(chuteiraRegexLatest));
      }`;

code = code.replace(latestRegex, latestReplacement);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Strict isolation applied to calcados!');
