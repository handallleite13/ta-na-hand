const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const app = { 
  get: (route, cb) => { if (route === '/api/latest') app.latest = cb; },
  use: () => {}, listen: () => {}
};
const express = () => app;
express.static = () => {};
code = code.replace(/const app = express\(\);/, '');
eval(code);

app.latest({ query: { c: 'fitness_geral' } }, {
  json: (data) => {
    console.log('Final array size before json:', data.length);
    const sus = data.filter(i => (i.domain||'').includes('007007haoyuntiyu'));
    if (sus.length > 0) {
      console.log('Found sus items:', sus.length);
    }
  }
});
