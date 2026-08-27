const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const prefix = `        </button>
      </div>
      <div class="p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar bg-slate-800">
        <div id="cart-list" class="flex flex-col gap-4"></div>`;
const suffix = `        </div>
      </div>
    </div>
  </div>

  <!-- Modal: Size Guide -->`;

if (code.includes(prefix) && code.includes(suffix)) {
    const p1 = code.split(prefix)[0];
    const p2 = code.split(suffix)[1];

    const newMiddle = `        </button>
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

    fs.writeFileSync('public/index.html', p1 + newMiddle + p2, 'utf8');
    console.log('Cart layout fixed using split boundaries!');
} else {
    console.log('Cart layout boundaries not found!');
}
