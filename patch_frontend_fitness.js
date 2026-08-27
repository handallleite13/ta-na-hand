const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Add "Fitness / Academia" to Category Dropdown
const categoryDropdownTarget = `<option value="calcados">👟 Calçados</option>`;
const categoryDropdownReplacement = `<option value="calcados">👟 Calçados</option>\n          <option value="fitness">🏋️ Fitness / Academia</option>`;
html = html.replace(categoryDropdownTarget, categoryDropdownReplacement);

// 2. Add "Roupa de Treino" to Smart Filters
const filterTarget = `<button data-filter="fan" class="filter-btn px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-full transition-colors">Torcedor</button>`;
const filterReplacement = `<button data-filter="fan" class="filter-btn px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-full transition-colors">Torcedor</button>\n          <button id="btn-treino" data-filter="treino" class="filter-btn px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-full transition-colors hidden">Roupa de Treino</button>`;
html = html.replace(filterTarget, filterReplacement);

// 3. Add toggle logic for the Treino button based on Category
const changeCategoryTarget = `if (cat === 'esportes') {
        subSelect.innerHTML`;
const changeCategoryReplacement = `if (cat === 'esportes') {
        document.getElementById('btn-treino').classList.remove('hidden');
        subSelect.innerHTML`;
html = html.replace(changeCategoryTarget, changeCategoryReplacement);

const changeCategoryTarget2 = `} else if (cat === 'calcados') {`;
const changeCategoryReplacement2 = `} else if (cat === 'calcados') {
        document.getElementById('btn-treino').classList.add('hidden');
        if (currentFilter === 'treino') document.querySelector('[data-filter="all"]').click();`;
html = html.replace(changeCategoryTarget2, changeCategoryReplacement2);

const changeCategoryTarget3 = `sub.classList.add('hidden');
      }`;
const changeCategoryReplacement3 = `sub.classList.add('hidden');
        document.getElementById('btn-treino').classList.add('hidden');
        if (currentFilter === 'treino') document.querySelector('[data-filter="all"]').click();
      }`;
html = html.replace(changeCategoryTarget3, changeCategoryReplacement3);

// 4. Add filter logic to applyFiltersAndRender
const applyFilterTarget = `} else if (currentFilter === 'masculino') {`;
const applyFilterReplacement = `} else if (currentFilter === 'treino') {
            filtered = dataset.filter(i => /training|tracksuit|survetement|chandal|tuta|训练|套装|出场服/i.test(i.titulo) || /training|tracksuit|survetement|chandal|tuta|训练|套装|出场服/i.test(i.original));
          } else if (currentFilter === 'masculino') {`;
html = html.replace(applyFilterTarget, applyFilterReplacement);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Frontend patched with Fitness category and Treino smart filter!');
