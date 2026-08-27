const fs = require('fs');
let pkg = fs.readFileSync('package.json', 'utf8');
pkg = pkg.replace(/"version": "0\.57\.0"/g, '"version": "0.58.0"');
fs.writeFileSync('package.json', pkg, 'utf8');

let html = fs.readFileSync('public/index.html', 'utf8');
html = html.replace(/BUILD v0\.57/g, 'BUILD v0.58');
fs.writeFileSync('public/index.html', html, 'utf8');
