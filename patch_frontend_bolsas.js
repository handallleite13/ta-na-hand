const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Add "Bolsas / Malas" to Category Dropdown
const categoryDropdownTarget = `<option value="fitness">🏋️ Fitness / Academia</option>`;
const categoryDropdownReplacement = `<option value="fitness">🏋️ Fitness / Academia</option>\n          <option value="bolsas">🎒 Bolsas / Malas</option>`;
html = html.replace(categoryDropdownTarget, categoryDropdownReplacement);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Frontend patched with Bolsas category!');
