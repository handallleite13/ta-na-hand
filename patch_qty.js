const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

// 1. Patch addToCart to handle quantities
const regexAddToCart = /window\.addToCart = function\(link\) \{[\s\S]*?cart\.push\(\{ \.\.\.item, size, cartId: Date\.now\(\)\.toString\(\) \}\);/g;
const replaceAddToCart = `window.addToCart = function(link) {
      const item = allResults.find(a => a.link === link) || favorites.find(a => a.link === link);
      if (!item) return;
      
      const domId = item.id || btoa(link).replace(/[^a-zA-Z0-9]/g, '');
      const select = document.getElementById(\`size-\${domId}\`);
      const size = select ? select.value : '';
      
      if (!size) {
        alert("⚠️ Por favor, escolha um tamanho (P, M, G...) antes de adicionar ao carrinho!");
        return;
      }
      
      const existingItem = cart.find(c => c.link === item.link && c.size === size);
      if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
          cart.push({ ...item, size, quantity: 1, cartId: Date.now().toString() });
      }`;
code = code.replace(regexAddToCart, replaceAddToCart);

// 2. Patch renderCart to show quantity controls
const regexRenderCart = /<p class="text-indigo-400 font-semibold text-sm mb-2">Tamanho: <span class="bg-indigo-600\/20 px-2 py-0\.5 rounded text-indigo-300">\$\{item\.size\}<\/span><\/p>\s*<div class="flex gap-2">/g;
const replaceRenderCart = `<p class="text-indigo-400 font-semibold text-sm mb-2">Tamanho: <span class="bg-indigo-600/20 px-2 py-0.5 rounded text-indigo-300">\${item.size}</span></p>
              <div class="flex items-center gap-3 mb-2">
                <button onclick="changeQty('\${item.cartId}', -1)" class="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold flex items-center justify-center transition-colors">-</button>
                <span class="text-white font-bold text-sm w-6 text-center">\${item.quantity || 1}</span>
                <button onclick="changeQty('\${item.cartId}', 1)" class="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold flex items-center justify-center transition-colors">+</button>
              </div>
              <div class="flex gap-2">`;
code = code.replace(regexRenderCart, replaceRenderCart);

// 3. Patch updateCounts to sum quantities
const regexUpdateCounts = /document\.getElementById\('cart-count'\)\.innerText = cart\.length;\s*document\.getElementById\('cart-count-m'\)\.innerText = cart\.length;/g;
const replaceUpdateCounts = `const totalCart = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      document.getElementById('cart-count').innerText = totalCart;
      document.getElementById('cart-count-m').innerText = totalCart;`;
code = code.replace(regexUpdateCounts, replaceUpdateCounts);

// 4. Patch generateOrder to show quantities
const regexGenerateOrder = /cart\.forEach\(\(item, idx\) => \{\s*text \+= \`\$\{idx \+ 1\}\) Link: \$\{item\.link\}\\n\`;/g;
const replaceGenerateOrder = `cart.forEach((item, idx) => {
        const qty = item.quantity || 1;
        const qtyText = qty > 1 ? \`\${qty}x \` : '';
        text += \`\${idx + 1}) \${qtyText}Link: \${item.link}\\n\`;`;
code = code.replace(regexGenerateOrder, replaceGenerateOrder);

// 5. Inject changeQty function
const regexChangeQty = /window\.removeFromCart = function\(cartId\) \{/g;
const replaceChangeQty = `window.changeQty = function(cartId, delta) {
      const item = cart.find(c => c.cartId === cartId);
      if (!item) return;
      item.quantity = (item.quantity || 1) + delta;
      if (item.quantity < 1) item.quantity = 1;
      localStorage.setItem('tnh_cart', JSON.stringify(cart));
      renderCart();
      updateCounts();
    };

    window.removeFromCart = function(cartId) {`;
code = code.replace(regexChangeQty, replaceChangeQty);

fs.writeFileSync('public/index.html', code, 'utf8');
console.log('Cart qty patched!');
