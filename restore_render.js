const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const renderItemFunc = `
    function renderItem(item) {
      const isFav = favorites.find(f => f.link === item.link);
      const heartColor = isFav ? "text-rose-500" : "text-white/70 hover:text-white";
      const heartFill = isFav ? "currentColor" : "none";
      
      const proxyCapa = (item.capa || item.img) ? \`/api/image?url=\${encodeURIComponent(item.capa || item.img)}&ref=\${encodeURIComponent(item.link)}\` : '';
      const capaImg = (item.capa || item.img) ? \`<img src="\${proxyCapa}" class="w-full aspect-square object-cover bg-slate-800 group-hover:scale-105 transition-transform duration-500" loading="lazy">\` : \`<div class="w-full aspect-square bg-slate-800 flex items-center justify-center text-slate-500 text-sm font-medium">Sem Imagem</div>\`;
      
      const domId = item.id || btoa(item.link).replace(/[^a-zA-Z0-9]/g, '');

      return \`
        <div class="bg-slate-800 rounded-2xl shadow-md hover:shadow-xl border border-slate-700 overflow-hidden flex flex-col group fade-in transition-all relative pb-2">
          
          <button onclick="toggleFav('\${item.link}', event)" class="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm \${heartColor} transition-colors">
            <svg class="w-5 h-5" fill="\${heartFill}" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </button>

          <a href="\${item.link}" target="_blank" class="relative overflow-hidden block shrink-0">
            \${capaImg}
            <div class="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors"></div>
          </a>
          
          <div class="p-4 pb-2 flex flex-col flex-1">
            <a href="\${item.link}" target="_blank" class="group-hover:text-indigo-400 transition-colors">
              <h3 class="font-bold text-white text-sm leading-tight line-clamp-2 mb-1" title="\${item.titulo}">\${item.titulo}</h3>
            </a>
            
            <div class="mt-auto pt-3 flex flex-col gap-2 border-t border-slate-700/50">
              <select id="size-\${domId}" class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                <option value="">Escolha o Tamanho</option>
                <option value="PP">PP</option>
                <option value="P">P</option>
                <option value="M">M</option>
                <option value="G">G</option>
                <option value="GG">GG</option>
              </select>
              
              <button onclick="addToCart('\${item.link}')" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition-colors text-xs flex items-center justify-center gap-1 shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Pôr no Carrinho
              </button>
            </div>
          </div>
        </div>
      \`;
    }

    function applyFiltersAndRender`;

html = html.replace('function applyFiltersAndRender', renderItemFunc);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Restored renderItem!');
