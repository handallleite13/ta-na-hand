const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const footerHtml = `
  </main>
  
  <!-- Footer -->
  <footer class="mt-auto py-10 border-t border-slate-800 bg-slate-900 text-center">
    <div class="max-w-7xl mx-auto px-4 flex flex-col items-center gap-3">
      <p class="text-slate-500 text-sm font-medium">Tá Na Hand © 2026 - Todos os direitos reservados.</p>
      <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700 shadow-inner" title="Sistema em desenvolvimento">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span class="text-xs font-bold text-slate-300 tracking-wider">BUILD v0.30</span>
      </div>
      <p class="text-xs text-slate-600 max-w-md">Plataforma em desenvolvimento. Rumo à versão 1.0 (Profissional e Escalável).</p>
    </div>
  </footer>
`;

html = html.replace('</main>', footerHtml);
fs.writeFileSync('public/index.html', html, 'utf8');

let pkg = fs.readFileSync('package.json', 'utf8');
pkg = pkg.replace(/"version": ".*?"/, '"version": "0.30.0"');
fs.writeFileSync('package.json', pkg, 'utf8');

console.log('Added footer with version 0.30');
