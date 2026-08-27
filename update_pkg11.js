const fs = require('fs');
let pkg = fs.readFileSync('package.json', 'utf8');
pkg = pkg.replace(/"version": "0\.55\.0"/g, '"version": "0.56.0"');
fs.writeFileSync('package.json', pkg, 'utf8');

let html = fs.readFileSync('public/index.html', 'utf8');
html = html.replace(/BUILD v0\.55/g, 'BUILD v0.56');
fs.writeFileSync('public/index.html', html, 'utf8');
