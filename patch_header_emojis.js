const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Replace everything between <body> and <!-- Search Component -->
const bodyStart = html.indexOf('<body');
const searchStart = html.indexOf('<!-- Search Component -->');

if (bodyStart !== -1 && searchStart !== -1) {
    const preBody = html.substring(0, html.indexOf('>', bodyStart) + 1);
    
    // I also need to fix the <title> tag
    html = html.replace(/<title>.*?<\/title>/, '<title>TÁ Na Hand! 🇧🇷 🇨🇳</title>');
    
    const newHeader = `
  <div class="min-h-screen flex flex-col bg-slate-900 text-slate-100 selection:bg-indigo-500/30">
    <!-- Header Decorativo -->
    <div class="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>

    <main class="flex-1 w-full relative z-10">
      <div class="max-w-7xl mx-auto px-4 py-16 sm:py-10 sm:px-6 lg:px-8 flex flex-col items-center">
        <!-- Written Logo -->
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

        <!-- Mensagem Inspiracional -->
        <p class="text-slate-400 text-center max-w-2xl text-lg sm:text-xl font-medium mb-12 fade-in shadow-sm drop-shadow-sm" style="animation-delay: 0.1s">
          O melhor do mundo <span class="text-indigo-400">direto nas suas mãos</span>.<br/>Busque, escolha e receba em casa!
        </p>
`;
    html = html.substring(0, preBody.length) + newHeader + html.substring(searchStart);
    
    // Also fix the footer
    html = html.replace(/T\ufffd Na Hand/g, 'TÁ Na Hand');
    html = html.replace(/T\? Na Hand/g, 'TÁ Na Hand');
    html = html.replace(/T Na Hand/g, 'TÁ Na Hand');
    
    fs.writeFileSync('public/index.html', html, 'utf8');
    console.log('Fixed header and title emojis!');
} else {
    console.log('Could not find markers');
}
