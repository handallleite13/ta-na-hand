const { lojas } = require('./scraper');
const allowedDomainsForCategory = (catStr) => {
  if (!catStr || catStr === 'todas') return null;
  // catStr format is 'esportes_futebol' or 'luxo_geral'
  const [main, sub] = catStr.split('_');
  if (lojas[main]) {
    if (sub && lojas[main][sub]) {
      return lojas[main][sub];
    }
    // se s tiver a principal, pega todas as subs
    let all = [];
    for (let s in lojas[main]) {
      all = all.concat(lojas[main][s]);
    }
    return all;
  }
  return [];
};
