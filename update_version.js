const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
html = html.replace(/BUILD v0\.44/g, 'BUILD v0.45');
fs.writeFileSync('public/index.html', html, 'utf8');

let pkg = fs.readFileSync('package.json', 'utf8');
pkg = pkg.replace(/"version": "0\.44\.0"/g, '"version": "0.45.0"');
fs.writeFileSync('package.json', pkg, 'utf8');
