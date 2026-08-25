const fs = require('fs');
const path = require('path');
const files = fs.readdirSync(__dirname);
const catFiles = files.filter(f => f.startsWith('catalogo') && f.endsWith('.json') && f !== 'catalogo.json');
for (let f of catFiles) {
  let filepath = path.join(__dirname, f);
  let data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  let changed = false;
  for (let i = 0; i < data.length; i++) {
    if (data[i].link && data[i].link.includes('&')) {
      data[i].link = data[i].link.split('&')[0];
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filepath, JSON.stringify(data));
    console.log('Fixed ' + f);
  }
}
