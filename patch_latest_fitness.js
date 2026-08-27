const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const target = `  if (c !== 'todas') {`;
const replacement = `  if (c !== 'todas' && !c.startsWith('fitness')) {`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.js', code, 'utf8');
    console.log('Patched latest category filter!');
} else {
    console.log('Target not found!');
}
