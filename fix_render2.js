const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const badRegex = /results\.forEach\(item => \{\s*list\.innerHTML \+= renderItem\(item\);\s*\}\);/;
const goodRender = `let htmlString = '';
      results.forEach(item => {
        htmlString += renderItem(item);
      });
      list.innerHTML = htmlString;`;

html = html.replace(badRegex, goodRender);
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed renderAll performance');
