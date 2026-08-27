const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Restore the outer block condition
code = code.replace(/if \(c !== 'todas' && !c\.startsWith\('fitness'\)\) \{/g, "if (c !== 'todas') {");

// 2. Fix the dominiosValidos logic to allow fitness to scan all domains
const dominiosTarget = `        if (c.startsWith('esportes') || c === 'bolsas') {
          dominiosValidos = flattenGroup(lojas.esportes);
        } else if (lojas[c]) {`;
const dominiosReplacement = `        if (c.startsWith('esportes') || c === 'bolsas') {
          dominiosValidos = flattenGroup(lojas.esportes);
        } else if (c.startsWith('fitness')) {
          dominiosValidos = flattenGroup(lojas);
        } else if (lojas[c]) {`;
code = code.replace(dominiosTarget, dominiosReplacement);

// 3. Remove the duplicate fitness block from server.js
// Find the first block and the second block.
const blocks = code.split('// --- FITNESS CATEGORIES ---');
// blocks[0] is everything before the first block
// blocks[1] is the first block
// blocks[2] is the second block
// blocks[3] is everything after the second block (if any)
if (blocks.length >= 3) {
  // We keep blocks[0], '...', blocks[1], and anything after the duplicate
  const beforeFirst = blocks[0];
  const firstBlock = blocks[1];
  
  // Notice that block 2 might contain other code at its end, let's just use string replacement for the exact duplicate.
}

fs.writeFileSync('server.js', code, 'utf8');
console.log('Restored fitness filtering!');
