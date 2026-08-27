const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /if \(\(c === 'luxo' \|\| c\.startsWith\('luxo_'\)\) \|\| c\.startsWith\('outros_'\)\) \{[\s\S]*?\}\s*\n/g;

const replacement = `if (c === 'luxo' || c.startsWith('luxo_') || c.startsWith('outros_')) {
           const sportsBrandsRegex = /nike|adidas|puma|converse|air jordan|jordan|vans|under armour|new balance|reebok|asics|fila|kappa|WXG-NK|WXG-AD|WXG-BM|WXG-KW/i;
           const luxuryBrands = /gucci|prada|louis vuitton|\\blv\\b|balenciaga|dior|burberry|versace|fendi|amiri|givenchy|chanel|hermes|rolex|古驰|普拉达|路易威登|巴黎世家|迪奥|博柏利|范思哲|芬迪/i;
           
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              if (c === 'luxo' || c.startsWith('luxo_')) {
                  // For luxo, MUST contain luxury brand, and MUST NOT be a bag or shoe
                  return t.match(luxuryBrands) && !t.match(bagsRegex) && !t.match(chuteiraRegex);
              } else {
                  // For outros_, just exclude everything
                  return !t.match(bagsRegex) && !t.match(chuteiraRegex) && !t.match(fitnessRegex) && !t.match(globalSportsRegex) && !t.match(sportsBrandsRegex);
              }
           });
        }\n`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Luxo patched!');
