const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Fix cart-container null reference
html = html.replace("const cartContainer = document.getElementById('cart-container');", "const cartContainer = document.getElementById('modal-cart');");

// Fix results-title missing element
const spinnerContext = `<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        
        <!-- Top Loading Indicator (Subtle) -->`;

const newTitleAndSpinner = `<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        
        <h2 id="results-title" class="text-xl sm:text-2xl font-bold text-white tracking-wide">Últimos Lançamentos</h2>

        <!-- Top Loading Indicator (Subtle) -->`;

html = html.replace(spinnerContext, newTitleAndSpinner);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed missing DOM IDs that crashed the site');
