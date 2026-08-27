const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// The original one that was missed
code = code.replace(/const flattenGroup = \(group\) => \{\r?\n\s*let arr = \[\];/g, "const flattenGroup = (group) => {\n        if (!group) return [];\n        if (Array.isArray(group)) return group;\n        let arr = [];");

fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed all instances');
