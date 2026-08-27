const fs = require('fs');
let pkg = fs.readFileSync('package.json', 'utf8');
pkg = pkg.replace(/"version": "0\.45\.0"/g, '"version": "0.46.0"');
fs.writeFileSync('package.json', pkg, 'utf8');
