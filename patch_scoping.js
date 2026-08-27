const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Move fitnessRegex to the global scope
const fitnessRegexDef = `const fitnessRegex = /yoga|lululemon|gymshark|alo yoga|nike pro|under armour|fitness|健身|瑜伽|紧身|速干|running|jogger|sweatpants|legging|training|卫衣|卫裤|外套|休闲|运动|套装|圆领|背心|夹克|长裤|短裤/i;`;

// Remove it from the fitness block
code = code.replace(/const fitnessRegex = [^\n]*\n/, '');

// Add it to the top global block (under bagsRegex)
code = code.replace(/const bagsRegex = [^\n]*\n/, (match) => match + fitnessRegexDef + '\n');

// Wait, the fitness block also re-defined teamTrainingRegex?
const teamTrainingFitnessDef = /const teamTrainingRegex = [^\n]*\n/;
// Actually, earlier I had `const teamTrainingRegex` defined TWICE! Once globally and once inside the fitness block!
// I'll just remove the one inside the fitness block.
code = code.replace(/if \(c === 'fitness'\) \{[\s\S]*?resultados = resultados\.filter/g, `if (c === 'fitness') {\n           resultados = resultados.filter`);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed regex scoping issue!');
