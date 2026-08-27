const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

// Update renderItem to pass event
code = code.replace(/onclick="addToCart\('\$\{item\.link\}'\)"/g, `onclick="addToCart('\${item.link}', event)"`);

// Update addToCart function definition
const regexAddToCartDef = /window\.addToCart = function\(link\) \{/g;
const replaceAddToCartDef = `window.addToCart = function(link, event) {`;
code = code.replace(regexAddToCartDef, replaceAddToCartDef);

// Update select finding logic in addToCart
const regexSelect = /const domId = item\.id \|\| btoa\(link\)\.replace\(\/\[\^a-zA-Z0-9\]\/g, ''\);\s*const select = document\.getElementById\(\`size-\$\{domId\}\`\);/g;
const replaceSelect = `let select = null;
      if (event && event.target) {
         const container = event.target.closest('.bg-slate-800');
         if (container) select = container.querySelector('select');
      }
      if (!select) {
         const domId = item.id || btoa(link).replace(/[^a-zA-Z0-9]/g, '');
         select = document.getElementById(\`size-\${domId}\`);
      }`;
code = code.replace(regexSelect, replaceSelect);

fs.writeFileSync('public/index.html', code, 'utf8');
console.log('DOM collision fixed!');
