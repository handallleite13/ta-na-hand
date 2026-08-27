const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');

const matches = [...code.matchAll(/const flattenGroup = \([\s\S]*?return arr;\s*\};/g)];
matches.forEach((m, i) => console.log(`Match ${i}:\n${m[0]}\n`));
