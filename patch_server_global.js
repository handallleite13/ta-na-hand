const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regexTitulo = /const (t|titulo|orig) = \((item\.original \|\| item\.titulo \|\| '')\)\.toLowerCase\(\);/g;
code = code.replace(regexTitulo, (match, varName) => {
    return `const ${varName} = ((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase();`;
});

// Also replace cases where they do inline .match without a variable assignment
// E.g. (item.original || item.titulo || '').toLowerCase().match
const inlineRegex = /\(item\.original \|\| item\.titulo \|\| ''\)\.toLowerCase\(\)\.match/g;
code = code.replace(inlineRegex, "((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase().match");

// And .includes
const inlineIncludesRegex = /\(item\.original \|\| item\.titulo \|\| ''\)\.toLowerCase\(\)\.includes/g;
code = code.replace(inlineIncludesRegex, "((item.yupoo_category_name || '') + ' ' + (item.original || item.titulo || '')).toLowerCase().includes");

fs.writeFileSync('server.js', code, 'utf8');
console.log('Server.js globally patched to read yupoo_category_name!');
