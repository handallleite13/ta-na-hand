const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regexReplace = /\/\/ Tratamento de frases multi-palavras antes de separar por espaço\s*q = q\.replace\(\/all blacks\/g, 'all_blacks'\);\s*q = q\.replace\(\/all black\/g, 'all_black'\);/;

const newReplace = `// Tratamento de frases multi-palavras antes de separar por espaço
        q = q.replace(/all blacks/g, 'all_blacks');
        q = q.replace(/all black/g, 'all_black');
        q = q.replace(/africa do sul/g, 'south_africa');
        q = q.replace(/áfrica do sul/g, 'south_africa');
        q = q.replace(/nova zelandia/g, 'new_zealand');
        q = q.replace(/nova zelândia/g, 'new_zealand');
        q = q.replace(/costa rica/g, 'costa_rica');
        q = q.replace(/arabia saudita/g, 'saudi_arabia');
        q = q.replace(/arábia saudita/g, 'saudi_arabia');
        q = q.replace(/coreia do sul/g, 'south_korea');
        q = q.replace(/estados unidos/g, 'united_states');
        q = q.replace(/reino unido/g, 'united_kingdom');`;

code = code.replace(regexReplace, newReplace);

const regexSynonyms = /'all_black': \['all_black'\]/;
const newSynonyms = `'all_black': ['all_black'],
          'south_africa': ['south_africa', '南非'],
          'new_zealand': ['new_zealand', 'zealand', '新西兰'],
          'costa_rica': ['costa_rica'],
          'saudi_arabia': ['saudi_arabia'],
          'south_korea': ['south_korea'],
          'united_states': ['united_states', 'usa', 'american'],
          'united_kingdom': ['united_kingdom', 'uk']`;

code = code.replace(regexSynonyms, newSynonyms);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Multi-word country names patched!');
