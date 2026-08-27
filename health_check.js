const http = require('http');

const checkEndpoint = (path, name) => {
  return new Promise(resolve => {
    http.get('http://localhost:3000' + path, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(raw);
          console.log(`[OK] ${name} returned ${data.length} items.`);
          resolve(data);
        } catch(e) {
          console.log(`[ERROR] ${name} failed: ${e.message}`);
          resolve(null);
        }
      });
    }).on('error', e => {
      console.log(`[ERROR] ${name} network error: ${e.message}`);
      resolve(null);
    });
  });
};

(async () => {
  console.log('Running Backend Health Checks...');
  await checkEndpoint('/api/latest?c=todas', 'Latest (Todas)');
  await checkEndpoint('/api/latest?c=luxo_geral', 'Latest (Luxo)');
  const outros = await checkEndpoint('/api/latest?c=outros_geral', 'Latest (Outros)');
  if (outros) {
    const sportsInOutros = outros.filter(i => (i.domain||'').includes('chenzhefuzhuang') || (i.domain||'').includes('007007haoyuntiyu'));
    console.log(' -> Sports leaking into Outros:', sportsInOutros.length);
  }
  
  await checkEndpoint('/api/search?q=nike', 'Search (Nike)');
  const searchBolsa = await checkEndpoint('/api/search?q=bolsa&c=bolsas', 'Search (Bolsa no c=bolsas)');
  
  const searchFitness = await checkEndpoint('/api/search?q=nike&c=fitness_geral', 'Search (Nike no Fitness)');
  if (searchFitness) {
    const sportsInFitnessSearch = searchFitness.filter(i => (i.domain||'').includes('007007haoyuntiyu'));
    console.log(' -> Sports leaking into Fitness Search:', sportsInFitnessSearch.length);
  }

  process.exit(0);
})();
