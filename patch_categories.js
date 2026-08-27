const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// We will inject the size chart filter right after dominiosValidos filter
const filterInjection = `      resultados = resultados.filter(item => dominiosValidos.includes(item.domain));
      // GLOBAL: Remove Size Charts
      resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(/尺码|size chart|tabela de tamanho|tamanho recomendado|尺码表/));`;

code = code.replace(/resultados = resultados\.filter\(item => dominiosValidos\.includes\(item\.domain\)\);/g, filterInjection);

// Fix Bolsas: add negative keywords for shoes/kailas
const bolsasFix = `        if (c === 'bolsas') {
           resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(bagsRegex) && !(item.titulo || '').toLowerCase().match(/包裹|kailas|vibram|徒步鞋|登山鞋|跑山|越野|跑鞋/));`;
code = code.replace(/if \(c === 'bolsas'\) \{\s+resultados = resultados\.filter\(item => \(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(bagsRegex\)\);\s+\}/g, bolsasFix);

// Fix Chuteiras: add negative keywords for socks/shin guards
const chuteirasFix = `      } else if (c === 'calcados_chuteiras') {
           resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(/meia|sock|leg guard|shin guard|护腿板|袜子/));
      }`;
code = code.replace(/\} else if \(c === 'calcados_chuteiras'\) \{\s+\}/g, chuteirasFix);

// Fix Luxo: Search all domains, and use luxury brands regex + exclude bags!
const luxoFix = `      } else if (c === 'luxo' || c.startsWith('luxo_') || c.startsWith('outros_')) {
           const luxuryBrands = /gucci|prada|louis vuitton|\\blv\\b|balenciaga|dior|burberry|versace|fendi|amiri|givenchy|chanel|hermes|rolex|古驰|普拉达|路易威登|巴黎世家|迪奥|博柏利|范思哲|芬迪/i;
           if (c === 'luxo' || c.startsWith('luxo_')) {
               resultados = resultados.filter(item => (item.titulo || '').toLowerCase().match(luxuryBrands) && !(item.titulo || '').toLowerCase().match(bagsRegex));
           } else {
               resultados = resultados.filter(item => !(item.titulo || '').toLowerCase().match(sportsBrandsRegex));
           }
      }`;
code = code.replace(/\} else if \(c === 'luxo' \|\| c\.startsWith\('luxo_'\) \|\| c\.startsWith\('outros_'\)\) \{\s+resultados = resultados\.filter\(item => !\(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(sportsBrandsRegex\)\);\s+\}/g, luxoFix);

// Also we need to make sure Luxo scans all domains!
// In the domain selection block:
const luxoDomainFix = `      } else if (c === 'luxo' || c.startsWith('luxo_')) {
        dominiosValidos = flattenGroup(lojas);
      } else if (lojas[c]) {`;
code = code.replace(/\} else if \(lojas\[c\]\) \{/g, luxoDomainFix);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Patches applied successfully!');
