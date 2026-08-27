const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const searchCart = `      <div class="p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar bg-slate-800">
        <div id="cart-list" class="flex flex-col gap-4"></div>
        <div class="bg-slate-900 p-6 rounded-2xl border border-slate-700 mt-4 text-center">
          <p class="text-slate-400 text-sm mb-4">Ao clicar abaixo, nós vamos gerar o texto do seu pedido traduzido para o padrão chinês e copiar para o seu celular. Basta colar na conversa com o vendedor no WhatsApp!</p>
          <button onclick="generateOrder()" class="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all text-lg flex items-center justify-center gap-2 mx-auto">
            Gerar Pedido para WhatsApp
          </button>
        </div>
      </div>`;

const replaceCart = `      <div class="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-800">
        <div id="cart-list" class="flex flex-col gap-4"></div>
      </div>
      <div class="bg-slate-900 p-4 sm:p-6 border-t border-slate-700 shrink-0 text-center">
        <p class="text-slate-400 text-xs sm:text-sm mb-4">Ao clicar abaixo, nós vamos gerar o texto do seu pedido traduzido para o padrão chinês e copiar para o seu celular. Basta colar na conversa com o vendedor no WhatsApp!</p>
        <button onclick="generateOrder()" class="w-full sm:w-auto px-8 py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all text-base sm:text-lg flex items-center justify-center gap-2 mx-auto">
          Gerar Pedido para WhatsApp
        </button>
      </div>`;

if (code.includes(searchCart)) {
    code = code.split(searchCart).join(replaceCart);
    fs.writeFileSync('public/index.html', code, 'utf8');
    console.log('Cart layout fixed!');
} else {
    console.log('Cart search string not found!');
}
