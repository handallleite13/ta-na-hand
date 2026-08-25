const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Fix /api/search category filtering: REMOVE IT
const searchRouteStart = code.indexOf('app.get(\'/api/search\'');
if (searchRouteStart > -1) {
  let searchLogic = code.substring(searchRouteStart);
  // Find the 'Filtrar por Categoria' block inside search and remove it
  const filterCatRegex = /\/\/\s*Filtrar por Categoria[\s\S]*?resultados\s*=\s*resultados\.filter\(item\s*=>\s*dominiosValidos\.includes\(item\.domain\)\);\s*\}/;
  searchLogic = searchLogic.replace(filterCatRegex, '// Busca global ignorando categoria conforme pedido');
  code = code.substring(0, searchRouteStart) + searchLogic;
}

// Fix missing 'original' field for frontend filters
code = code.replace(/res\.json\(resultados\.slice\(-50\)\.reverse\(\)\.map\(i\s*=>\s*\(\{\.\.\.i,\s*titulo:\s*traduzirTitulo\(i\.titulo\)\}\)\)\);/g, 
"res.json(resultados.slice(-50).reverse().map(i => ({...i, original: i.titulo, titulo: traduzirTitulo(i.titulo)})));");

code = code.replace(/res\.json\(resultados\.slice\(0,\s*50\)\.map\(i\s*=>\s*\(\{\.\.\.i,\s*titulo:\s*traduzirTitulo\(i\.titulo\)\}\)\)\);/g, 
"res.json(resultados.slice(0, 50).map(i => ({...i, original: i.titulo, titulo: traduzirTitulo(i.titulo)})));");

fs.writeFileSync('server.js', code);
console.log('Fixed server.js global search and original title');
