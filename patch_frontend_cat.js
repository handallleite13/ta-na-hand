const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Replace fetchLatestAndRender
const fetchLatestRegex = /function fetchLatestAndRender[\s\S]*?const res = await fetch\(`\/api\/latest\?c=\$\{category\}&p=\$\{currentPage\}`\);/;

const fetchLatestReplacement = `function fetchLatestAndRender(isLoadMore = false) {
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
      document.getElementById('bottom-status').classList.remove('hidden');

      try {
        const res = await fetch(\`/api/latest?c=\${category}&p=\${currentPage}\`);`;

html = html.replace(fetchLatestRegex, fetchLatestReplacement);


// Replace executeSearch
const executeSearchRegex = /async function executeSearch[\s\S]*?const res = await fetch\(`\/api\/search\?q=\$\{encodeURIComponent\(currentQuery\)\}&p=\$\{currentPage\}`\);/;

const executeSearchReplacement = `async function executeSearch(isLoadMore = false) {
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
        const res = await fetch(\`/api/search?q=\${encodeURIComponent(currentQuery)}&c=\${category}&p=\${currentPage}\`);`;

html = html.replace(executeSearchRegex, executeSearchReplacement);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Frontend logic patched!');
