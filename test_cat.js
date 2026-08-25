const { lojas } = require('./scraper');
const flattenGroup = (group) => {
  let arr = [];
  for (let key in group) {
    if (Array.isArray(group[key])) arr.push(...group[key]);
    else if (typeof group[key] === 'object') arr = arr.concat(flattenGroup(group[key]));
  }
  return arr;
};
let c = 'luxo';
let dominiosValidos = [];
if (c === 'esportes') {
  dominiosValidos = flattenGroup(lojas.esportes);
} else if (c.startsWith('esportes_') && lojas.esportes[c.split('_')[1]]) {
  dominiosValidos = lojas.esportes[c.split('_')[1]];
} else if (lojas[c]) {
  dominiosValidos = flattenGroup(lojas[c]);
}
console.log('Luxo domains:', dominiosValidos);
