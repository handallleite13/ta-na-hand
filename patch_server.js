const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /if \(c === 'luxo_sneakers'\) \{[\s\S]*?return !isSneaker && !t.match\(chuteiraRegex\);\s*\}/;

const replace = `if (c === 'luxo_sneakers') {
                      return isSneaker;
                  } else if (c === 'luxo_banho') {
                      return t.match(/swim|beach|sunga|bikini|biquini|biquíni|maiô|maio|泳衣|泳裤|比基尼|沙滩裤|沙滩|swimming|banho/i);
                  } else if (c === 'luxo_underwear') {
                      return t.match(/underwear|cueca|calcinha|lingerie|sutiã|sutia|boxer|brief|panties|\\bbra\\b|内衣|内裤|胸罩|文胸/i);
                  } else if (c === 'luxo_vestidos') {
                      return t.match(/dress|skirt|vestido|saia|裙|连衣裙|半身裙|长裙|短裙/i);
                  } else if (c === 'luxo_roupas') {
                      const isVestido = t.match(/dress|skirt|vestido|saia|裙|连衣裙|半身裙|长裙|短裙/i);
                      const isUnderwear = t.match(/underwear|cueca|calcinha|lingerie|sutiã|sutia|boxer|brief|panties|\\bbra\\b|内衣|内裤|胸罩|文胸/i);
                      const isBanho = t.match(/swim|beach|sunga|bikini|biquini|biquíni|maiô|maio|泳衣|泳裤|比基尼|沙滩裤|沙滩|swimming|banho/i);
                      return !isSneaker && !isVestido && !isUnderwear && !isBanho && !t.match(chuteiraRegex);
                  }`;

if (code.match(regex)) {
    code = code.replace(regex, replace);
    fs.writeFileSync('server.js', code, 'utf8');
    console.log('Server updated!');
} else {
    console.log('Regex failed in server.js');
}
