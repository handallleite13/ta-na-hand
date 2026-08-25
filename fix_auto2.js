const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const autoStart = code.indexOf('app.get(\'/api/autocomplete\'');
const latestStart = code.indexOf('app.get(\'/api/latest\'');
if (autoStart > -1 && latestStart > -1) {
  const newAuto = `app.get('/api/autocomplete', (req, res) => {
    const query = req.query.q || '';
    if (!query || query.length < 3) return res.json([]);
    const termo = query.toLowerCase();
    
    let database = [];
    try {
      const fsReq = require('fs');
      const pathReq = require('path');
      const files = fsReq.readdirSync(__dirname);
      const catFiles = files.filter(f => f.startsWith('catalogo') && f.endsWith('.json'));
      for (let f of catFiles) {
        const filePath = pathReq.join(__dirname, f);
        const data = JSON.parse(fsReq.readFileSync(filePath, 'utf8'));
        database = database.concat(data);
      }
    } catch(e) {}

    const resultados = database.filter(item => 
      (item.titulo || '').toLowerCase().includes(termo)
    ).slice(0, 50);
    
    res.json(resultados.map(i => ({...i, original: i.titulo, titulo: traduzirTitulo(i.titulo)})));
  });

  `;
  code = code.substring(0, autoStart) + newAuto + code.substring(latestStart);
}
fs.writeFileSync('server.js', code);
console.log('Fixed autocomplete');
