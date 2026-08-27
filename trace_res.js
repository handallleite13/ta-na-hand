const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
code = code.replace(/const limit = 50;/, 'const limit = 1000000;');

const injections = [
    { search: "if (c === 'social') {", inject: "console.log('Before social block:', resultados.length);" },
    { search: "} else if (c !== 'todas') {", inject: "console.log('After social block:', resultados.length);" },
    { search: "function renderItem", inject: "console.log('At the end of latest:', resultados.length);" }
];

for (const inj of injections) {
    code = code.replace(inj.search, inj.inject + '\n' + inj.search);
}

const app = { get: (route, cb) => { if (route === '/api/latest') app.latest = cb; }, use: () => {}, listen: () => {} };
const express = () => app;
express.static = () => {};
code = code.replace(/const app = express\(\);/, '');
eval(code);

app.latest({ query: { c: 'social', p: 1 } }, {
  setHeader: () => {},
  json: () => {}
});
