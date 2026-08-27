const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /if \(c === 'luxo' \|\| c\.startsWith\('luxo_'\)\) \{\s+\/\/ For luxo, MUST contain luxury brand, and MUST NOT be a bag or shoe\s+return t\.match\(luxuryBrands\) && !t\.match\(bagsRegex\) && !t\.match\(chuteiraRegex\);\s+\}/g;

const replacement = `if (c === 'luxo' || c.startsWith('luxo_')) {
                  if (!t.match(luxuryBrands) || t.match(bagsRegex)) return false;
                  
                  const isSneaker = t.match(/sneaker|shoe|tenis|tênis|dunk|jordan|force|skool|sapatilha|boot|鞋/i);
                  
                  if (c === 'luxo_sneakers') {
                      return isSneaker;
                  } else if (c === 'luxo_roupas') {
                      return !isSneaker && !t.match(chuteiraRegex);
                  }
                  
                  return !t.match(chuteiraRegex); // Geral keeps everything except bags/cleats
              }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Luxo subcategories patched!');
