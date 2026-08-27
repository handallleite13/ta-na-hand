const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const flattenRegex = /const flattenGroup = \(group\) => \{\s+let arr = \[\];/g;
code = code.replace(flattenRegex, "const flattenGroup = (group) => {\n        if (!group) return [];\n        if (Array.isArray(group)) return group;\n        let arr = [];");

fs.writeFileSync('server.js', code, 'utf8');
console.log('flattenGroup fixed!');
