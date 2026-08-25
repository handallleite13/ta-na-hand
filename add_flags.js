const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const oldLogo = <a href="/" class="block mb-8 hover:opacity-90 transition-opacity">
        <h1 class="text-5xl font-black tracking-tighter pr-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 uppercase italic">
          T&aacute; Na Hand!
        </h1>
      </a>;
      
// Maybe it uses literal "T&aacute; Na Hand!" or "Tá Na Hand!"
// Let's just use regex to insert the flags safely.

html = html.replace(
  /T[á&aacute;] Na Hand!/,
  'Tá Na Hand! 🇧🇷 🇨🇳'
);

fs.writeFileSync('public/index.html', html);
console.log('Added flags to index.html');
