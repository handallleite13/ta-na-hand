const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const search = `    function renderFavsModal() {
      const favsList = document.getElementById('favs-list');
      if (favorites.length === 0) {
        favsList.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500 text-lg">Você não tem favoritos ainda.</div>';
        return;
      }
      
      favsList.innerHTML = favorites.map(item => \`
        <div class="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-md relative group hover:border-slate-500 transition-colors">
          <button onclick="toggleFav('\${item.id}', '\${item.link}')" class="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-md rounded-full text-rose-500 hover:text-white transition-colors z-10">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
          <a href="\${item.link}" target="_blank" class="block aspect-square overflow-hidden bg-slate-900 relative">
            <img src="\${item.img || ''}" alt="Capa" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
          </a>
          <div class="p-3 sm:p-4">
            <h3 class="text-white text-sm sm:text-base font-medium line-clamp-2 leading-snug mb-3" title="\${item.titulo}">\${item.titulo}</h3>
            <button onclick="addToCart(\${item.id}, '\${item.link}', '\${item.titulo.replace(/'/g, "\\\\'")}', '\${item.img}')" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Adicionar
            </button>
          </div>
        </div>
      \`).join('');
    }`;

const replace = `    function renderFavsModal() {
      const favsList = document.getElementById('favs-list');
      if (favorites.length === 0) {
        favsList.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500 text-lg">Você não tem favoritos ainda.</div>';
        return;
      }
      favsList.innerHTML = favorites.map(item => renderItem(item)).join('');
    }`;

if (code.includes(search)) {
    code = code.split(search).join(replace);
    fs.writeFileSync('public/index.html', code, 'utf8');
    console.log('Fixed renderFavsModal successfully!');
} else {
    console.log('Search string not found in index.html! Let me use index.indexOf.');
}
