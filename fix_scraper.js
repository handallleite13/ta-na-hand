const fs = require('fs');
let code = fs.readFileSync('scraper.js', 'utf8');

// Normalize line endings
code = code.replace(/\r\n/g, '\n');

code = code.replace(/\s*"https:\/\/pp111115555\.x\.yupoo\.com",?\n/g, '\n');

const searchStr = `  esportes: {\n    futebol: [`;
const replaceStr = `  esportes: {\n    equipamentos: [\n      "https://pp111115555.x.yupoo.com"\n    ],\n    futebol: [`;

code = code.replace(searchStr, replaceStr);

// Convert back to \r\n if needed, or just let node write \n
fs.writeFileSync('scraper.js', code, 'utf8');
console.log('patched scraper.js!');
