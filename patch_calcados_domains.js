const fs = require('fs');

let scraper = fs.readFileSync('scraper.js', 'utf8');
const oldCalcados = /calcados:\s*\{\s*geral:\s*\[[\s\S]*?\]\s*\}/;
const newCalcados = `calcados: {
      geral: [
        "https://gaoduan001.x.yupoo.com",
        "https://yehecheng.x.yupoo.com",
        "https://ywq2000.x.yupoo.com",
        "https://dachang88.x.yupoo.com"
      ],
      chuteiras: [
        "https://gaoduan001.x.yupoo.com",
        "https://yehecheng.x.yupoo.com",
        "https://ywq2000.x.yupoo.com",
        "https://dachang88.x.yupoo.com"
      ],
      casuais: [
        "https://gaoduan001.x.yupoo.com",
        "https://yehecheng.x.yupoo.com",
        "https://ywq2000.x.yupoo.com",
        "https://dachang88.x.yupoo.com"
      ]
    }`;
scraper = scraper.replace(oldCalcados, newCalcados);
fs.writeFileSync('scraper.js', scraper, 'utf8');
console.log('scraper.js updated to allow keyword separation!');
