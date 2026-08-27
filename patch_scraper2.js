const fs = require('fs');
let code = fs.readFileSync('scraper.js', 'utf8');

const regex = /geral: \[\s*"https:\/\/vipno1\.x\.yupoo\.com",/g;
const replacement = `geral: [
        "https://407131796.x.yupoo.com",
        "https://3179704378.x.yupoo.com",
        "https://vipno1.x.yupoo.com",`;
code = code.replace(regex, replacement);

fs.writeFileSync('scraper.js', code, 'utf8');
console.log('Scraper patched for real!');
