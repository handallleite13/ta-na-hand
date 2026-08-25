const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Update btn-search logic to executeSearch function
const searchRegex = /document\.getElementById\('btn-search'\)\.addEventListener\('click',\s*async\s*\(\)\s*=>\s*\{[\s\S]*?catch\s*\(e\)\s*\{\s*console\.error\(e\);\s*\}\s*finally\s*\{\s*document\.getElementById\('search-spinner'\)\.classList\.add\('hidden'\);\s*\}\s*\}\);/g;
const newSearch = `async function executeSearch(isLoadMore = false) {
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

      try {
        const res = await fetch(\`/api/search?q=\${encodeURIComponent(currentQuery)}&p=\${currentPage}\`);
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
`;

html = html.replace(searchRegex, newSearch);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed HTML Phase 2');
