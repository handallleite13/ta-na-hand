const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const searchFem = `/women|woman|female|lady|ladies|女|feminino|feminina|mulher/i.test(i.original));`;
const replaceFem = `/women|woman|female|lady|ladies|女|feminino|feminina|mulher/i.test(i.original) || (i.yupoo_category_name && /women|woman|female|lady|ladies|女|feminino|feminina|mulher/i.test(i.yupoo_category_name)));`;
code = code.replace(searchFem, replaceFem);

const searchMasc = `/man|men|male|男|masculino|mens|homem/i.test(i.original))`;
const replaceMasc = `/man|men|male|男|masculino|mens|homem/i.test(i.original) || (i.yupoo_category_name && /man|men|male|男|masculino|mens|homem/i.test(i.yupoo_category_name)))`;
code = code.replace(searchMasc, replaceMasc);

// Do it again for the negative condition in Masculino
const searchMascFemExclude = `/women|woman|female|lady|ladies|女|feminino|feminina|mulher/i.test(i.original))`;
const replaceMascFemExclude = `/women|woman|female|lady|ladies|女|feminino|feminina|mulher/i.test(i.original) || (i.yupoo_category_name && /women|woman|female|lady|ladies|女|feminino|feminina|mulher/i.test(i.yupoo_category_name)))`;
code = code.replace(searchMascFemExclude, replaceMascFemExclude);

fs.writeFileSync('public/index.html', code, 'utf8');
console.log('Frontend index.html patched for new category tracking!');
