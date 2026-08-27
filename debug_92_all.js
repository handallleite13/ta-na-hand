const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
code = code.replace(/const limit = 50;/, 'const limit = 1000000;');

const debugInjection = `
                 if (t.includes('92')) {
                     console.log('TESTING 92:', t);
                 }
                 if (sub === 'beisebol'`;
code = code.replace(/if \(sub === 'beisebol'/g, debugInjection);

const app = { get: (route, cb) => { if (route === '/api/latest') app.latest = cb; }, use: () => {}, listen: () => {} };
const express = () => app;
express.static = () => {};
code = code.replace(/const app = express\(\);/, '');
eval(code);

app.latest({ query: { c: 'esportes_automobilismo', p: 1 } }, {
  setHeader: () => {},
  json: () => {}
});
