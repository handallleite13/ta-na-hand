const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// The corrupted string looks like this: T Na Hand! ???? ???? ?? ???? ????
// We can just use a simple regex replacing anything that contains "Na Hand!" and the rest of the line
html = html.replace(/<title>.*<\/title>/g, '<title>Tá Na Hand! 🇧🇷 🇨🇳 🚀 🇧🇷 🇨🇳</title>');
html = html.replace(/T[^\s]*\sNa\sHand![\s\S]*?<\/h1>/g, 'Tá Na Hand! 🇧🇷 🇨🇳 🚀</h1>');
html = html.replace(/ltimos Lanamentos/g, 'Últimos Lançamentos');
html = html.replace(/No foi possvel/g, 'Não foi possível');
html = html.replace(/padro chins/g, 'padrão chinês');
html = html.replace(/Ol,/g, 'Olá,');
html = html.replace(/ns vamos/g, 'nós vamos');
html = html.replace(/\? Pedido gerado/g, '✅ Pedido gerado');
html = html.replace(/Opes/g, 'Opções');
html = html.replace(/Catlogo/g, 'Catálogo');
html = html.replace(/Coleo/g, 'Coleção');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed HTML encoding');
