const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

if (!html.includes('id="results-title"')) {
  html = html.replace(/<!-- Top Loading Indicator \(Subtle\) -->/, '<h2 id="results-title" class="text-xl sm:text-2xl font-bold text-white tracking-wide">Últimos Lançamentos</h2>\n        <!-- Top Loading Indicator (Subtle) -->');
  fs.writeFileSync('public/index.html', html, 'utf8');
  console.log('Fixed results-title!');
} else {
  console.log('results-title already exists');
}
