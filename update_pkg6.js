const fs = require('fs');
let pkg = fs.readFileSync('package.json', 'utf8');
pkg = pkg.replace(/"version": "0\.50\.0"/g, '"version": "0.51.0"');
fs.writeFileSync('package.json', pkg, 'utf8');

let html = fs.readFileSync('public/index.html', 'utf8');
html = html.replace(/BUILD v0\.50/g, 'BUILD v0.51');
fs.writeFileSync('public/index.html', html, 'utf8');
