const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const regexCart = /<div id="modal-cart" class="fixed inset-0 bg-black\/90 z-50 hidden flex flex-col items-center justify-center p-4 backdrop-blur-sm">[\s\S]*?<!-- Modal: Size Guide -->/g;

const replaceCart = `<div id="modal-cart" class="fixed inset-0 bg-black/90 z-50 hidden flex flex-col items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-700">
      <div class="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900 shrink-0">
        <h2 class="text-xl font-bold text-white flex items-center gap-2">Meu Carrinho</h2>
        <button onclick="document.getElementById('modal-cart').classList.add('hidden')" class="text-slate-400 hover:text-white transition-colors bg-slate-700 hover:bg-rose-500 rounded-full p-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div class="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-800">
        <div id="cart-list" class="flex flex-col gap-4"></div>
      </div>
      <div class="bg-slate-900 p-4 sm:p-6 border-t border-slate-700 shrink-0 text-center">
        <p class="text-slate-400 text-xs sm:text-sm mb-4">Ao clicar abaixo, nós vamos gerar o texto do seu pedido traduzido para o padrão chinês e copiar para o seu celular. Basta colar na conversa com o vendedor no WhatsApp!</p>
        <button onclick="generateOrder()" class="w-full sm:w-auto px-8 py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all text-base sm:text-lg flex items-center justify-center gap-2 mx-auto">
          Gerar Pedido para WhatsApp
        </button>
      </div>
    </div>
  </div>

  <!-- Modal: Size Guide -->`;

code = code.replace(regexCart, replaceCart);
fs.writeFileSync('public/index.html', code, 'utf8');
console.log('Cart completely replaced!');
