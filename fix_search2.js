const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /const keywords = query\.split\(\/\\s\+\/\)\.filter\(k => k\.length > 0\);/;
const newLogic = `const stopWords = ['de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'em', 'um', 'uma', 'o', 'a', 'os', 'as'];
      const keywords = query.split(/\\s+/).filter(k => k.length > 0 && !stopWords.includes(k));`;

code = code.replace(regex, newLogic);
fs.writeFileSync('server.js', code);
console.log('Fixed stop words in search');
