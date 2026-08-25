const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const regex = /<h1 class="text-5xl font-black tracking-tighter pr-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 uppercase italic">\s*Tá Na Hand! 🇧🇷 🇨🇳 🚀\s*<\/h1>/;

const newH1 = `<h1 class="text-5xl font-black tracking-tighter pr-2 uppercase italic flex flex-wrap items-center gap-2">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Tá Na Hand!</span>
          <span class="not-italic text-4xl" style="-webkit-text-fill-color: initial;">🇧🇷 🇨🇳 🚀</span>
        </h1>`;

html = html.replace(regex, newH1);
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed H1 CSS rendering for emojis');
