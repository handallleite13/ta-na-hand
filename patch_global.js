const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /resultados = resultados\.filter\(item => !\(item\.titulo \|\| ''\)\.toLowerCase\(\)\.match\(\/尺码\|size chart\|tabela de tamanho\|tamanho recomendado\|尺码表\/\)\);/g;
const replacement = `resultados = resultados.filter(item => {
        const t = (item.titulo || '').toLowerCase();
        // GLOBAL BLOCKS: Size charts, links to albums (not actual items), and the specific NBA generic size chart title
        if (t === 'nba篮球球衣') return false;
        if (t.match(/尺码|size chart|tabela de tamanho|tamanho recomendado|尺码表|size table|size guide|measurements/i)) return false;
        if (t.match(/álbum de treinamento|album link|image link|catalog link|patch accessories|link do álbum/i)) return false;
        return true;
      });`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Global blocks patched!');
