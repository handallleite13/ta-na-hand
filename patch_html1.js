const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Update state variables
html = html.replace(/let allResults = \[\];/, 'let allResults = [];\n      let currentPage = 1;\n      let currentEndpoint = "";\n      let isLoadingMore = false;\n      let hasMore = true;\n      let currentQuery = "";');

// 2. Update applyFiltersAndRender
const oldApplyRegex = /function applyFiltersAndRender\(dataset\) \{[\s\S]*?list\.innerHTML = htmlString;\s*\}/;
const newApply = `function applyFiltersAndRender(dataset, append = false) {
        let filtered = dataset;
        if (currentFilter === 'player') {
          filtered = dataset.filter(i => /jogador|player|球员|adv/i.test(i.titulo) || /jogador|player|球员|adv/i.test(i.original));
        } else if (currentFilter === 'fan') {
          filtered = dataset.filter(i => /torcedor|fan|球迷/i.test(i.titulo) || /torcedor|fan|球迷/i.test(i.original));
        } else if (currentFilter === 'infantil') {
          filtered = dataset.filter(i => /kids|child|youth|童|infantil|menino|menina|boy|girl/i.test(i.titulo) || /kids|child|youth|童|infantil|menino|menina|boy|girl/i.test(i.original));
        } else if (currentFilter === 'feminino') {
          filtered = dataset.filter(i => /women|woman|female|lady|ladies|女|feminino|feminina|mulher/i.test(i.titulo) || /women|woman|female|lady|ladies|女|feminino|feminina|mulher/i.test(i.original));
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
      }`;
html = html.replace(oldApplyRegex, newApply);

// 3. Update filter tab click listener to not append
html = html.replace(/applyFiltersAndRender\(showingFavorites \? favorites : allResults\);/g, 'applyFiltersAndRender(showingFavorites ? favorites : allResults, false);');

// 4. Update fetchLatestAndRender
const oldFetchRegex = /async function fetchLatestAndRender\(\) \{[\s\S]*?catch\s*\(e\)\s*\{\s*document\.getElementById\('search-spinner'\)\.classList\.add\('hidden'\);\s*\}\s*\}/;
const newFetch = `async function fetchLatestAndRender(isLoadMore = false) {
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
      if (category === 'esportes') {
        const sub = document.getElementById('sub-category').value;
        if (sub && sub !== 'geral') category = 'esportes_' + sub;
      }

      container.classList.remove('hidden');
      document.getElementById('results-title').innerText = "Últimos Lançamentos";
      document.getElementById('search-spinner').classList.remove('hidden');
      document.getElementById('bottom-status').classList.add('hidden');

      try {
        const res = await fetch(\`/api/latest?c=\${encodeURIComponent(category)}&p=\${currentPage}\`);
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
    }`;
html = html.replace(oldFetchRegex, newFetch);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed HTML Phase 1');
