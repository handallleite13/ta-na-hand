const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Fix Basquete (remove hawks and kings without word boundaries to avoid NFL overlap)
code = code.replace(/hawks\|国王\|kings\|/g, '\\\\bhawks\\\\b|国王|\\\\bkings\\\\b|');
// Replace 老鹰 (Laoying - Hawks/Eagles overlap) with specific atlanta hawks
code = code.replace(/老鹰\|/g, 'atlanta hawks|');

// 2. Fix Automobilismo (Racing 92 rugby overlap)
code = code.replace(/formula one\|racing\|ferrari/g, 'formula one|red bull racing|ferrari');

// 3. Fix Chuteiras (Add track spikes, turf shoes, shin guards)
// const chuteiraRegex = /fg|tf|ag|sg|mg|ic|in|cleat|chuteira|足球鞋|橄榄球鞋|football|mercurial|predator|f50|phantom|tiempo|copa|future|superfly|vapor/i;
code = code.replace(/vapor\/i;/, 'vapor|spike|astro|leg guard|shin guard|钉鞋|护腿板/i;');

fs.writeFileSync('server.js', code, 'utf8');
console.log('Regexes patched successfully!');
