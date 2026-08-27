const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regexBanho = /\/swim\|beach\|sunga\|bikini\|biquini\|biquíni\|maiô\|maio\|泳衣\|泳裤\|比基尼\|沙滩裤\|沙滩\|swimming\|banho\/i/g;
const replaceBanho = '/swim|beach|sunga|bikini|biquini|biquíni|maiô|maio|泳|比基尼|沙滩|swimming|banho/i';

code = code.replace(regexBanho, replaceBanho);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Regex banho updated!');
