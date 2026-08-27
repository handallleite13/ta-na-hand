const fs = require('fs');
let code = fs.readFileSync('scraper.js', 'utf8');

code = code.replace(/"https:\/\/407131796\.x\.yupoo\.com",\s*/g, '');
code = code.replace(/"https:\/\/3179704378\.x\.yupoo\.com",\s*/g, '');

const luxoGeralRegex = /geral: \[\s*"http:\/\/vipno1\.x\.yupoo\.com",/g;
const luxoGeralReplacement = `geral: [
      "https://407131796.x.yupoo.com",
      "https://3179704378.x.yupoo.com",
      "http://vipno1.x.yupoo.com",`;
code = code.replace(luxoGeralRegex, luxoGeralReplacement);

fs.writeFileSync('scraper.js', code, 'utf8');
console.log('Scraper patched!');
