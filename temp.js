
    let evtSource = null;
    let allResults = [];
      let currentPage = 1;
      let currentEndpoint = "";
      let isLoadingMore = false;
      let hasMore = true;
      let currentQuery = "";
    let currentFilter = 'all';
    
    let showingFavorites = false;
    let showingCart = false;

    let favorites = JSON.parse(localStorage.getItem('tnh_favs')) || [];
    let cart = JSON.parse(localStorage.getItem('tnh_cart')) || [];

    const list = document.getElementById('results-list');
    const container = document.getElementById('results-container');
    const cartContainer = document.getElementById('modal-cart');
    
    // Atualiza contadores UI
    function updateCounts() {
      document.getElementById('fav-count').innerText = favorites.length;
      document.getElementById('fav-count-m').innerText = favorites.length;
      document.getElementById('cart-count').innerText = cart.length;
      document.getElementById('cart-count-m').innerText = cart.length;
    }
    updateCounts();

    // Toggle Favoritos
    document.getElementById('btn-toggle-favs').addEventListener('click', () => {
      document.getElementById('modal-favs').classList.remove('hidden');
      renderFavsModal();
    });

    function renderFavsModal() {
      const favsList = document.getElementById('favs-list');
      if (favorites.length === 0) {
        favsList.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500 text-lg">Você não tem favoritos ainda.</div>';
        return;
      }
      
      favsList.innerHTML = favorites.map(item => `
        <div class="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-md relative group hover:border-slate-500 transition-colors">
          <button onclick="toggleFav('${item.id}', '${item.link}')" class="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-md rounded-full text-rose-500 hover:text-white transition-colors z-10">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
          <a href="${item.link}" target="_blank" class="block aspect-square overflow-hidden bg-slate-900 relative">
            <img src="${item.img || ''}" alt="Capa" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
          </a>
          <div class="p-3 sm:p-4">
            <h3 class="text-white text-sm sm:text-base font-medium line-clamp-2 leading-snug mb-3" title="${item.titulo}">${item.titulo}</h3>
            <button onclick="addToCart(${item.id}, '${item.link}', '${item.titulo.replace(/'/g, "\\'")}', '${item.img}')" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Adicionar
            </button>
          </div>
        </div>
      `).join('');
    }

    // Toggle Carrinho
    document.getElementById('btn-toggle-cart').addEventListener('click', () => {
      document.getElementById('modal-cart').classList.remove('hidden');
      renderCart();
    });

    // Funções de Favorito
    window.toggleFav = function(link, event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      const isFav = favorites.find(f => f.link === link);
      if (isFav) {
        favorites = favorites.filter(f => f.link !== link);
      } else {
        const item = allResults.find(a => a.link === link) || favorites.find(a => a.link === link) || cart.find(a => a.link === link);
        if (item) favorites.push(item);
      }
      localStorage.setItem('tnh_favs', JSON.stringify(favorites));
      updateCounts();
      
      
      if (!document.getElementById('modal-favs').classList.contains('hidden')) {
        renderFavsModal();
      }
      if (showingFavorites) applyFiltersAndRender(favorites);
      else if (!showingCart) applyFiltersAndRender(allResults);
    };

    // Funções de Carrinho
    window.addToCart = function(link) {
      const item = allResults.find(a => a.link === link) || favorites.find(a => a.link === link);
      if (!item) return;
      
      // Capturar o ID que é seguro para DOM
      const domId = item.id || btoa(link).replace(/[^a-zA-Z0-9]/g, '');
      const select = document.getElementById(`size-${domId}`);
      const size = select ? select.value : '';
      
      if (!size) {
        alert("⚠️ Por favor, escolha um tamanho (P, M, G...) antes de adicionar ao carrinho!");
        return;
      }
      
      cart.push({ ...item, size, cartId: Date.now().toString() });
      localStorage.setItem('tnh_cart', JSON.stringify(cart));
      updateCounts();
      
      
      if (!document.getElementById('modal-favs').classList.contains('hidden')) {
        renderFavsModal();
      }
      // Reset select feedback
      if(select) select.value = "";
      alert("✅ Adicionado ao carrinho!");
    };

    window.removeFromCart = function(cartId) {
      cart = cart.filter(c => c.cartId !== cartId);
      localStorage.setItem('tnh_cart', JSON.stringify(cart));
      updateCounts();
      renderCart();
    };

    function renderCart() {
      const cartList = document.getElementById('cart-list');
      cartList.innerHTML = '';
      
      if (cart.length === 0) {
        cartList.innerHTML = '<div class="py-12 text-center text-slate-500">Seu carrinho está vazio.</div>';
        return;
      }

      cart.forEach(item => {
        const proxyCapa = (item.capa || item.img) ? `/api/image?url=${encodeURIComponent(item.capa || item.img)}&ref=${encodeURIComponent(item.link)}` : '';
        const imgHtml = proxyCapa 
          ? `<img src="${proxyCapa}" class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg bg-slate-800 shrink-0">` 
          : `<div class="w-20 h-20 sm:w-24 sm:h-24 bg-slate-800 rounded-lg flex items-center justify-center shrink-0"><span class="text-xs text-slate-500">Sem Img</span></div>`;
        
        cartList.innerHTML += `
          <div class="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700 flex gap-4 items-center fade-in relative">
            ${imgHtml}
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-white text-sm sm:text-base leading-tight truncate mb-1" title="${item.titulo}">${item.titulo}</h4>
              <p class="text-indigo-400 font-semibold text-sm mb-2">Tamanho: <span class="bg-indigo-600/20 px-2 py-0.5 rounded text-indigo-300">${item.size}</span></p>
              <div class="flex gap-2">
                <a href="${item.link}" target="_blank" class="text-xs text-slate-400 hover:text-white underline">Ver Catálogo</a>
              </div>
            </div>
            <button onclick="removeFromCart('${item.cartId}')" class="p-2 sm:px-4 sm:py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-lg transition-colors shrink-0">
              <svg class="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              <span class="hidden sm:inline text-sm font-semibold">Remover</span>
            </button>
          </div>
        `;
      });
    }

    window.generateOrder = function() {
      if (cart.length === 0) return;
      
      const sizeMap = {
        'PP': 'S',
        'P': 'M',
        'M': 'L',
        'G': 'XL',
        'GG': '2XL'
      };

      let text = "Olá, gostaria de encomendar os seguintes itens:\n\n";
      
      cart.forEach((item, idx) => {
        text += `${idx + 1}) Link: ${item.link}\n`;
        text += `Tamanho: ${sizeMap[item.size] || item.size}\n\n`;
      });

      navigator.clipboard.writeText(text).then(() => {
        alert("✅ Pedido gerado e COPIADO!\n\nAbra a conversa com o vendedor no WhatsApp e clique em Colar.");
      }).catch(err => {
        alert("Não foi possível copiar automaticamente. Selecione e copie o texto abaixo:\n\n" + text);
      });
    };

    // Filtros e Render
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.remove('bg-indigo-600', 'text-white');
          b.classList.add('bg-slate-700', 'text-slate-300');
        });
        e.target.classList.remove('bg-slate-700', 'text-slate-300');
        e.target.classList.add('bg-indigo-600', 'text-white');
        
        currentFilter = e.target.getAttribute('data-filter');
        applyFiltersAndRender(showingFavorites ? favorites : allResults, false);
      });
    });

    
    function renderItem(item) {
      const isFav = favorites.find(f => f.link === item.link);
      const heartColor = isFav ? "text-rose-500" : "text-white/70 hover:text-white";
      const heartFill = isFav ? "currentColor" : "none";
      
      const proxyCapa = (item.capa || item.img) ? `/api/image?url=${encodeURIComponent(item.capa || item.img)}&ref=${encodeURIComponent(item.link)}` : '';
      const capaImg = (item.capa || item.img) ? `<img src="${proxyCapa}" class="w-full aspect-square object-cover bg-slate-800 group-hover:scale-105 transition-transform duration-500" loading="lazy">` : `<div class="w-full aspect-square bg-slate-800 flex items-center justify-center text-slate-500 text-sm font-medium">Sem Imagem</div>`;
      
      const domId = item.id || btoa(item.link).replace(/[^a-zA-Z0-9]/g, '');

      return `
        <div class="bg-slate-800 rounded-2xl shadow-md hover:shadow-xl border border-slate-700 overflow-hidden flex flex-col group fade-in transition-all relative pb-2">
          
          <button onclick="toggleFav('${item.link}', event)" class="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm ${heartColor} transition-colors">
            <svg class="w-5 h-5" fill="${heartFill}" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </button>

          <a href="${item.link}" target="_blank" class="relative overflow-hidden block shrink-0">
            ${capaImg}
            <div class="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors"></div>
          </a>
          
          <div class="p-4 pb-2 flex flex-col flex-1">
            <a href="${item.link}" target="_blank" class="group-hover:text-indigo-400 transition-colors">
              <h3 class="font-bold text-white text-sm leading-tight line-clamp-2 mb-1" title="${item.titulo}">${item.titulo}</h3>
            </a>
            
            <div class="mt-auto pt-3 flex flex-col gap-2 border-t border-slate-700/50">
              <select id="size-${domId}" class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                <option value="">Escolha o Tamanho</option>
                <option value="PP">PP</option>
                <option value="P">P</option>
                <option value="M">M</option>
                <option value="G">G</option>
                <option value="GG">GG</option>
              </select>
              
              <button onclick="addToCart('${item.link}')" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition-colors text-xs flex items-center justify-center gap-1 shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Pôr no Carrinho
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function applyFiltersAndRender(dataset, append = false) {
        let filtered = dataset;
        if (currentFilter === 'player') {
          filtered = dataset.filter(i => /jogador|player|球员|adv/i.test(i.titulo) || /jogador|player|球员|adv/i.test(i.original));
        } else if (currentFilter === 'fan') {
          filtered = dataset.filter(i => /torcedor|fan|球迷/i.test(i.titulo) || /torcedor|fan|球迷/i.test(i.original));
        } else if (currentFilter === 'infantil') {
          filtered = dataset.filter(i => /kids|child|youth|童|infantil|menino|menina|boy|girl/i.test(i.titulo) || /kids|child|youth|童|infantil|menino|menina|boy|girl/i.test(i.original));
        } else if (currentFilter === 'feminino') {
          filtered = dataset.filter(i => /women|woman|female|lady|ladies|女|feminino|feminina|mulher/i.test(i.titulo) || /women|woman|female|lady|ladies|女|feminino|feminina|mulher/i.test(i.original));
        } else if (currentFilter === 'treino') {
            filtered = dataset.filter(i => /training|tracksuit|survetement|chandal|tuta|训练|套装|出场服/i.test(i.titulo) || /training|tracksuit|survetement|chandal|tuta|训练|套装|出场服/i.test(i.original));
          } else if (currentFilter === 'masculino') {
          filtered = dataset.filter(i => !/women|woman|female|lady|ladies|女|feminino|feminina|mulher/i.test(i.original) && !/kids|child|youth|童|infantil|menino|menina|boy|girl/i.test(i.original));
        }
        
        let htmlString = '';
        filtered.forEach(item => {
          htmlString += renderItem(item);
        });
        
        if (append) {
          list.insertAdjacentHTML('beforeend', htmlString);
        } else {
          list.innerHTML = htmlString;
        }
      }

    // Busca ao vivo (Autocomplete)
    let typingTimer;
    document.getElementById('query').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(typingTimer);
        document.getElementById('btn-search').click();
        return;
      }
      
      clearTimeout(typingTimer);
      typingTimer = setTimeout(async () => {
        const query = e.target.value.trim();
        if (showingFavorites || showingCart) return;
        
        if (query.length >= 3) {
          try {
            const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data && data.length > 0) {
              container.classList.remove('hidden');
              document.getElementById('results-title').innerText = "Resultados";
              allResults = data;
              allResults.sort((a, b) => b.id - a.id);
              applyFiltersAndRender(allResults);
            }
          } catch(err) {}
        }
      }, 400);
    });

    // Mudança de Categoria e Auto-Pesquisa
    document.getElementById('category').addEventListener('change', (e) => {
      const cat = e.target.value;
      const sub = document.getElementById('sub-category-wrapper');
      const subSelect = document.getElementById('sub-category');
      
      if (cat === 'esportes') {
        subSelect.innerHTML = `
          <option value="geral">Geral</option>
          <option value="automobilismo">Automobilismo</option>
          <option value="basquete">Basquete</option>
          <option value="beisebol">Beisebol</option>
          <option value="futebol">Futebol</option>
          <option value="futebol_americano">Fut. Americano</option>
          <option value="rugby">Rugby</option>
            <option value="outros">Outros Esportes</option>
        `;
        sub.classList.remove('hidden');
      } else if (cat === 'calcados') {
        document.getElementById('btn-treino').classList.add('hidden');
        if (currentFilter === 'treino') document.querySelector('[data-filter="all"]').click();
        subSelect.innerHTML = `
          <option value="geral">Geral</option>
          <option value="chuteiras">Chuteiras</option>
          <option value="casuais">Outros Calçados</option>
        `;
        sub.classList.remove('hidden');
      } else {
        sub.classList.add('hidden');
      }
      
      if (document.getElementById('query').value.trim() === '') {
        fetchLatestAndRender();
      }
    });

    document.getElementById('sub-category').addEventListener('change', () => {
      if (document.getElementById('query').value.trim() === '') {
        fetchLatestAndRender();
      }
    });

    async function fetchLatestAndRender(isLoadMore = false) {
      if (!isLoadMore) {
        currentPage = 1;
        hasMore = true;
        allResults = [];
        list.innerHTML = '';
        currentEndpoint = 'latest';
      }
      if (!hasMore || isLoadingMore) return;
      isLoadingMore = true;
      showingFavorites = false;
      showingCart = false;
      cartContainer.classList.add('hidden');
      
      let category = document.getElementById('category').value;
      if (!document.getElementById('sub-category-wrapper').classList.contains('hidden')) {
        const sub = document.getElementById('sub-category').value;
        if (sub && sub !== 'geral') category = category + '_' + sub;
      }

      container.classList.remove('hidden');
      document.getElementById('results-title').innerText = "Últimos Lançamentos";
      document.getElementById('search-spinner').classList.remove('hidden');
      document.getElementById('bottom-status').classList.add('hidden');

      try {
        const res = await fetch(`/api/latest?c=${encodeURIComponent(category)}&p=${currentPage}`);
        const data = await res.json();
        document.getElementById('search-spinner').classList.add('hidden');
        
        if (data.length < 50) hasMore = false;
        
        if (data && data.length > 0) {
          allResults = allResults.concat(data);
          applyFiltersAndRender(data, isLoadMore);
          currentPage++;
        } else if (!isLoadMore) {
          list.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500 text-lg">Nenhum catálogo encontrado.</div>';
        }
      } catch (e) {
        document.getElementById('search-spinner').classList.add('hidden');
      }
      isLoadingMore = false;
    }
    
    // Auto-carrega ao abrir o site
    window.addEventListener('DOMContentLoaded', () => {
      fetchLatestAndRender();
    });

    // Busca Real (SSE)
    async function executeSearch(isLoadMore = false) {
      if (!isLoadMore) {
        currentPage = 1;
        hasMore = true;
        allResults = [];
        list.innerHTML = '';
        currentEndpoint = 'search';
        currentQuery = document.getElementById('query').value.trim();
        
        document.getElementById('stat-encontrados').innerText = '0';
        document.getElementById('results-title').innerText = currentQuery ? "Resultados" : "Últimos Lançamentos";
        container.classList.remove('hidden');
      }
      
      if (!hasMore || isLoadingMore) return;
      isLoadingMore = true;
      showingFavorites = false;
      showingCart = false;
      cartContainer.classList.add('hidden');
      
      document.getElementById('search-spinner').classList.remove('hidden');
      document.getElementById('bottom-status').classList.remove('hidden');

      let category = document.getElementById('category').value;
      if (!document.getElementById('sub-category-wrapper').classList.contains('hidden')) {
        const sub = document.getElementById('sub-category').value;
        if (sub && sub !== 'geral') category = category + '_' + sub;
      }

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(currentQuery)}&c=${category}&p=${currentPage}`);
        const data = await res.json();
        
        if (data.length < 50) hasMore = false;
        
        if (data && data.length > 0) {
          allResults = allResults.concat(data);
          document.getElementById('stat-encontrados').innerText = allResults.length;
          applyFiltersAndRender(data, isLoadMore);
          currentPage++;
        } else if (!isLoadMore) {
          list.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500 text-lg">Nenhum resultado encontrado no catálogo local.</div>';
        }
      } catch (e) {
        console.error(e);
      } finally {
        document.getElementById('search-spinner').classList.add('hidden');
      }
      isLoadingMore = false;
    }

    document.getElementById('btn-search').addEventListener('click', () => {
      executeSearch(false);
    });

    window.addEventListener('scroll', () => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 800) {
        if (currentEndpoint === 'latest') {
          fetchLatestAndRender(true);
        } else if (currentEndpoint === 'search') {
          executeSearch(true);
        }
      }
    });


    // Remove btn-stop as it's no longer needed for instant searches
    // We can just leave the empty function to avoid breaking HTML
    document.getElementById('btn-stop').addEventListener('click', () => {
      // Do nothing
    });

    function finishSearch() {
      document.getElementById('search-spinner').classList.add('hidden');
    }
  