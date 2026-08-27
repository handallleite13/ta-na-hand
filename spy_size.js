const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const app = { 
  get: (route, cb) => { if (route === '/api/latest') app.latest = cb; },
  use: () => {}, listen: () => {}
};
const express = () => app;
express.static = () => {};
code = code.replace(/const app = express\(\);/, '');
code = code.replace(/const limit = 50;/, 'console.log("Resultados size before pagination:", resultados.length); const limit = 50;');
eval(code);

app.latest({ query: { c: 'fitness_geral' } }, {
  json: (data) => {}
});
