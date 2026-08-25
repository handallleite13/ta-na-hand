const fs = require('fs');
let lines = fs.readFileSync('public/index.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<title>')) {
    lines[i] = '  <title>Tá Na Hand! 🇧🇷 🇨🇳 🚀 🇧🇷 🇨🇳</title>';
  }
  if (lines[i].includes('Na Hand!') && !lines[i].includes('<title>')) {
    lines[i] = '          Tá Na Hand! 🇧🇷 🇨🇳 🚀';
  }
  lines[i] = lines[i].replace(/ltimos Lanamentos/g, 'Últimos Lançamentos');
  lines[i] = lines[i].replace(/No foi possvel/g, 'Não foi possível');
  lines[i] = lines[i].replace(/padro chins/g, 'padrão chinês');
  lines[i] = lines[i].replace(/Ol,/g, 'Olá,');
  lines[i] = lines[i].replace(/ns vamos/g, 'nós vamos');
  lines[i] = lines[i].replace(/\? Pedido gerado/g, '✅ Pedido gerado');
  lines[i] = lines[i].replace(/Opes/g, 'Opções');
  lines[i] = lines[i].replace(/Catlogo/g, 'Catálogo');
  lines[i] = lines[i].replace(/Coleo/g, 'Coleção');
}

fs.writeFileSync('public/index.html', lines.join('\n'), 'utf8');
