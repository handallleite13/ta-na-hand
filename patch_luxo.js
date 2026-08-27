const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /\/\/ --- GLOBAL ISOLATION FOR LUXO AND OUTROS ---\s+if \(c\.startsWith\('luxo_'\) \|\| c\.startsWith\('outros_'\)\) \{\s+resultados = resultados\.filter\(item => \{\s+const t = \(item\.titulo \|\| ''\)\.toLowerCase\(\);\s+\/\/ Block Bags, Shoes, Fitness, and ALL Sports\s+return !t\.match\(bagsRegex\) && !t\.match\(chuteiraRegex\) && !t\.match\(fitnessRegex\) && !t\.match\(globalSportsRegex\);\s+\}\);\s+\}/;

const replacement = `// --- GLOBAL ISOLATION FOR LUXO AND OUTROS ---
        if (c.startsWith('luxo_') || c.startsWith('outros_')) {
           const sportsBrandsRegex = /nike|adidas|puma|converse|air jordan|jordan|vans|under armour|new balance|reebok|asics|fila|kappa|WXG-NK|WXG-AD|WXG-BM|WXG-KW/i;
           resultados = resultados.filter(item => {
              const t = (item.titulo || '').toLowerCase();
              // Block Bags, Shoes, Fitness, and ALL Sports
              return !t.match(bagsRegex) && !t.match(chuteiraRegex) && !t.match(fitnessRegex) && !t.match(globalSportsRegex) && !t.match(sportsBrandsRegex);
           });
        }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed Luxo isolation!');
