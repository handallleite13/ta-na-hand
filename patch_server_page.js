const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Patch /api/search pagination
const searchRegex = /res\.json\(resultados\.slice\(0,\s*300\)\.map\(i\s*=>\s*\(\{\.\.\.i,\s*original:\s*i\.titulo,\s*titulo:\s*traduzirTitulo\(i\.titulo\)\}\)\)\);/g;
const newSearchRet = `
    const page = parseInt(req.query.p) || 1;
    const limit = 50;
    // We reverse search results because we want the latest scraped items first!
    const start = Math.max(0, resultados.length - (page * limit));
    const end = resultados.length - ((page - 1) * limit);
    const paginated = end > 0 ? resultados.slice(start, end).reverse() : [];
    res.json(paginated.map(i => ({...i, original: i.titulo, titulo: traduzirTitulo(i.titulo)})));`;
code = code.replace(searchRegex, newSearchRet);

// Patch /api/latest pagination
const latestRegex = /res\.json\(resultados\.slice\(-50\)\.reverse\(\)\.map\(i\s*=>\s*\(\{\.\.\.i,\s*original:\s*i\.titulo,\s*titulo:\s*traduzirTitulo\(i\.titulo\)\}\)\)\);/g;
const newLatestRet = `
    const page = parseInt(req.query.p) || 1;
    const limit = 50;
    const start = Math.max(0, resultados.length - (page * limit));
    const end = resultados.length - ((page - 1) * limit);
    const paginated = end > 0 ? resultados.slice(start, end).reverse() : [];
    res.json(paginated.map(i => ({...i, original: i.titulo, titulo: traduzirTitulo(i.titulo)})));`;
code = code.replace(latestRegex, newLatestRet);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed Server Pagination');
