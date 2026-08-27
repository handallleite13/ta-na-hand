const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Find the logo section
const logoStart = html.indexOf('<!-- Written Logo -->');
const logoEnd = html.indexOf('<!-- Search Component -->');

if (logoStart !== -1 && logoEnd !== -1) {
    const oldLogoChunk = html.substring(logoStart, logoEnd);
    
    // Create new layout
    const newLogoChunk = `<!-- Written Logo -->
      <a href="/" class="block mb-8 hover:opacity-90 transition-opacity">
        <div class="flex items-center justify-center gap-2 sm:gap-4">
          <!-- Bandeira Brasil (Esquerda) -->
          <span class="text-3xl sm:text-4xl shadow-sm drop-shadow-md">🇧🇷</span>
          
          <!-- Logo Tá Na Hand! -->
          <h1 class="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic py-2">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 pr-2 sm:pr-3">TÁ NA HAND!</span>
          </h1>
          
          <!-- Bandeira China (Direita) -->
          <span class="text-3xl sm:text-4xl shadow-sm drop-shadow-md">🇨🇳</span>
        </div>
      </a>

      `;
      
    html = html.replace(oldLogoChunk, newLogoChunk);
    fs.writeFileSync('public/index.html', html, 'utf8');
    console.log('Logo patched successfully!');
} else {
    console.log('Could not find logo boundaries.');
}
