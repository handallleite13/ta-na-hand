const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const badRender = esults.forEach(item => {
        list.innerHTML += renderItem(item);
      });;

const goodRender = let htmlString = '';
      results.forEach(item => {
        htmlString += renderItem(item);
      });
      list.innerHTML = htmlString;;

html = html.replace(badRender, goodRender);
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed renderAll performance');
