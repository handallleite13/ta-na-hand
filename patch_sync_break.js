const fs = require('fs');
let code = fs.readFileSync('sync.js', 'utf8');

// Remove the break condition for existing items
const searchBreak = `        // Se encontramos 10 itens seguidos que já existiam, paramos de ler essa categoria para economizar tempo
        if (jaExistentesNaSequencia >= 10 && !cat.href.includes('/categories?page=')) {
            break;
        }`;

code = code.replace(searchBreak, `        // FORÇANDO VARREDURA COMPLETA: Removida a trava de 10 itens para poder taguear o catálogo antigo inteiro.
        // if (jaExistentesNaSequencia >= 10 && !cat.href.includes('/categories?page=')) {
        //    break;
        // }`);

// Make sure saveDB is called even if novos === 0, because we are updating existing items
const searchSave = `        if (novos > 0) saveDB();`;
const replaceSave = `        saveDB(); // Salva sempre, pois estamos atualizando as tags de categorias dos itens existentes`;

code = code.replace(searchSave, replaceSave);

fs.writeFileSync('sync.js', code, 'utf8');
console.log('sync.js corrigido para varredura completa!');
