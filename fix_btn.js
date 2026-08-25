const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Un-hide the search button
html = html.replace(/<button id="btn-search" class="hidden /g, '<button id="btn-search" class="');
// Remove the stupid check from autocomplete
html = html.replace(/ \|\| document\.getElementById\('btn-search'\)\.classList\.contains\('hidden'\)/g, '');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed btn-search visibility and autocomplete block');
